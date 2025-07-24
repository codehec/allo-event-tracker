import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Web3 from 'web3';
import { EventEmitter } from 'events';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';

export interface BlockchainConfig {
  name: string;
  wssUrl: string;
  chainId: number;
  contracts: ContractConfig[];
}

export interface ContractConfig {
  address: string;
  name: string;
}

export interface BlockchainEventData {
  chainName: string;
  contractAddress: string;
  eventName: string;
  eventData: any;
  blockNumber: string;
  txHash: string;
  timestamp: string;
  date: string;
}

@Injectable()
export class Web3Service extends EventEmitter implements OnModuleDestroy {
  private readonly logger = new Logger(Web3Service.name);
  private web3Connections: Map<string, Web3> = new Map();
  private subscriptions: Map<string, any> = new Map();
  private connected = false;

  constructor(
    private readonly eventRepository: EventRepository
  ) {
    super();
  }

  async connectToMultipleChains(blockchainConfigs: BlockchainConfig[]): Promise<void> {
    this.logger.log('Connecting to blockchains');

    for (const config of blockchainConfigs) {
      try {
        await this.connectToChain(config);
      } catch (error) {
        this.logger.error(`Failed to connect to ${config.name}: ${error.message}`);
      }
    }

    this.connected = true;
    this.logger.log('Connection setup completed');
  }

  private async connectToChain(config: BlockchainConfig): Promise<void> {
    try {
      if (!config.wssUrl || config.wssUrl.trim() === '') {
        throw new Error(`WebSocket URL is empty for chain: ${config.name}`);
      }

      const web3 = new Web3(new Web3.providers.WebsocketProvider(config.wssUrl));
      
      await web3.eth.getChainId();
      
      this.web3Connections.set(config.name, web3);
      this.logger.log(`Connected to ${config.name}`);

      const provider = web3.provider as any;
      if (provider) {
        provider.on('connect', () => {
          this.logger.log(`WebSocket connected to ${config.name}`);
        });

        provider.on('error', (error: any) => {
          this.logger.error(`WebSocket error on ${config.name}:`, error);
        });

        provider.on('end', () => {
          this.logger.warn(`WebSocket connection ended for ${config.name}`);
        });

        provider.on('close', () => {
          this.logger.warn(`WebSocket connection closed for ${config.name}`);
        });
      }

      await this.subscribeToEvents(config.name, config.contracts);

    } catch (error) {
      this.logger.error(`Failed to connect to ${config.name}:`, error);
      throw error;
    }
  }

  private async subscribeToEvents(chainName: string, contracts: ContractConfig[]): Promise<void> {
    const web3 = this.web3Connections.get(chainName);
    if (!web3) {
      this.logger.error(`No WebSocket connection: ${chainName}`);
      return;
    }

    try {
      const contractAddresses = contracts.map(contract => contract.address);
      
      const subscription = await web3.eth.subscribe('logs', {
        address: contractAddresses
      });

      subscription.on('data', async (log: any) => {
        await this.processLog(chainName, contracts, log);
      });

      subscription.on('error', (error: any) => {
        this.logger.error(`Log subscription error on ${chainName}:`, error);
      });

      const subscriptionKey = `${chainName}-logs`;
      this.subscriptions.set(subscriptionKey, subscription);
      
      this.logger.log(`Subscribed to logs on ${chainName}`);
      
    } catch (error) {
      this.logger.error(`Failed to subscribe to logs on ${chainName}:`, error);
    }
  }

  private async processLog(chainName: string, contracts: ContractConfig[], log: any): Promise<void> {
    const contractAddress = log.address?.toLowerCase();
    const contract = contracts.find(c => c.address.toLowerCase() === contractAddress);
    
    if (!contract) {
      this.logger.warn(`Received log for unknown contract: ${contractAddress}`);
      return;
    }

    const web3 = this.web3Connections.get(chainName);
    if (!web3) {
      this.logger.error(`No Web3 connection: ${chainName}`);
      return;
    }

    try {
      const eventSignature = log.topics[0];
      
      const depositedSignature = web3.utils.sha3('Deposited(address,address,address,uint256,uint256,uint256)');
      const redeemedSignature = web3.utils.sha3('Redeemed(address,address,address,uint256,uint256,uint256)');

      if (eventSignature === depositedSignature) {
        await this.processDepositedEvent(chainName, contract, log, web3);
      } else if (eventSignature === redeemedSignature) {
        await this.processRedeemedEvent(chainName, contract, log, web3);
      } else {
        this.logger.debug(`Unknown event signature: ${eventSignature}`);
      }
    } catch (error) {
      this.logger.error(`Error processing log: ${error.message}`);
    }
  }

  private async getBlockDateFromTimestamp(web3: Web3, blockNumber: string): Promise<{ date: string, timestamp: string }> {
    try {
      const block = await web3.eth.getBlock(blockNumber);
      if (block && block.timestamp) {
        return {
          date: new Date(Number(block.timestamp) * 1000).toISOString(),
          timestamp: block.timestamp.toString()
        };
      }
      return { date: new Date().toISOString(), timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.warn(`Error getting block timestamp: ${error.message}`);
      return { date: new Date().toISOString(), timestamp: new Date().toISOString() };
    }
  }

  private async processDepositedEvent(chainName: string, contract: ContractConfig, log: any, web3: Web3): Promise<void> {
    try {
      const decodedLog = web3.eth.abi.decodeLog(
        [
          { type: 'address', name: 'user', indexed: true },
          { type: 'address', name: 'assetToken', indexed: true },
          { type: 'address', name: 'stablecoin', indexed: true },
          { type: 'uint256', name: 'amount', indexed: false },
          { type: 'uint256', name: 'tokenAmount', indexed: false },
          { type: 'uint256', name: 'fee', indexed: false }
        ],
        log.data,
        [log.topics[1], log.topics[2], log.topics[3]]
      );

      const { date, timestamp } = await this.getBlockDateFromTimestamp(web3, log.blockNumber);
      const eventData: BlockchainEventData = {
        chainName,
        contractAddress: contract.address,
        eventName: 'Deposited',
        eventData: {
          user: decodedLog.user as string,
          assetToken: decodedLog.assetToken as string,
          stablecoin: decodedLog.stablecoin as string,
          amount: (decodedLog.amount as bigint).toString(),
          tokenAmount: (decodedLog.tokenAmount as bigint).toString(),
          fee: (decodedLog.fee as bigint).toString()
        },
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        timestamp: timestamp,
        date: date
      };

      await this.storeEventInDatabase(eventData, contract.name);
      this.emit('event', eventData);
      this.logger.log(`Deposited event from ${contract.name} on ${chainName}:`, eventData);
    } catch (error) {
      this.logger.error(`Error processing Deposited event: ${error.message}`);
    }
  }

  private async processRedeemedEvent(chainName: string, contract: ContractConfig, log: any, web3: Web3): Promise<void> {
    try {
      const decodedLog = web3.eth.abi.decodeLog(
        [
          { type: 'address', name: 'user', indexed: true },
          { type: 'address', name: 'assetToken', indexed: true },
          { type: 'address', name: 'stablecoin', indexed: true },
          { type: 'uint256', name: 'tokenAmount', indexed: false },
          { type: 'uint256', name: 'amount', indexed: false },
          { type: 'uint256', name: 'fee', indexed: false }
        ],
        log.data,
        [log.topics[1], log.topics[2], log.topics[3]]
      );

      const { date, timestamp } = await this.getBlockDateFromTimestamp(web3, log.blockNumber);

      const eventData = {
        chainName,
        contractAddress: contract.address,
        eventName: 'Redeemed',
        eventData: {
          user: decodedLog.user as string,
          assetToken: decodedLog.assetToken as string,
          stablecoin: decodedLog.stablecoin as string,
          tokenAmount: (decodedLog.tokenAmount as bigint).toString(),
          amount: (decodedLog.amount as bigint).toString(),
          fee: (decodedLog.fee as bigint).toString()
        },
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        timestamp: timestamp,
        date: date
      };

      await this.storeEventInDatabase(eventData, contract.name);
      this.emit('event', eventData);
      this.logger.log(`Redeemed event from ${contract.name} on ${chainName}:`, eventData);
    } catch (error) {
      this.logger.error(`Error processing Redeemed event: ${error.message}`);
    }
  }

  private async storeEventInDatabase(eventData: BlockchainEventData, contractName: string): Promise<void> {
    try {
      const existingEvent = await this.eventRepository.findByTxHash(eventData.txHash);
      if (existingEvent) {
        this.logger.warn(`Duplicate event detected, skipping: ${eventData.txHash}`);
        return;
      }

      const dbEvent: Partial<Event> = {
        chain_name: eventData.chainName,
        event_type: eventData.eventName.toLowerCase(),
        contract_address: eventData.contractAddress,
        tx_hash: eventData.txHash,
        block_number: parseInt(eventData.blockNumber),
        user: eventData.eventData.user,
        asset_token: eventData.eventData.assetToken,
        stablecoin: eventData.eventData.stablecoin,
        amount: eventData.eventData.amount,
        token_amount: eventData.eventData.tokenAmount,
        fee: eventData.eventData.fee,
        event_data: eventData.eventData,
        timestamp: eventData.timestamp,
        date: new Date(eventData.date)
      };

      await this.eventRepository.create(dbEvent);
      this.logger.log(`${eventData.eventName} event stored in database: ${eventData.txHash}`);
    } catch (error) {
      this.logger.error(`Error storing event in database: ${error.message}`);
    }
  }

  async storePreviousEvents(blockchainConfigs: BlockchainConfig[], fromBlock?: number): Promise<void> {
    this.logger.log('Starting to fetch and store previous events...');

    for (const config of blockchainConfigs) {
      try {
        await this.storePreviousEventsForChain(config, fromBlock);
      } catch (error) {
        this.logger.error(`Failed to store previous events for ${config.name}: ${error.message}`);
      }
    }

    this.logger.log('Finished storing previous events');
  }

  private async storePreviousEventsForChain(config: BlockchainConfig, fromBlock?: number): Promise<void> {
    const web3 = this.web3Connections.get(config.name);
    if (!web3) {
      this.logger.error(`No Web3 connection for ${config.name}`);
      return;
    }

    try {
      const currentBlock = await web3.eth.getBlockNumber();
      const startBlock = fromBlock || Math.max(0, Number(currentBlock) - 100000);

      this.logger.log(`Fetching events for ${config.name} from block ${startBlock} to ${currentBlock}`);

      for (const contract of config.contracts) {
        await this.fetchAndStoreContractEvents(web3, config.name, contract, startBlock, Number(currentBlock));
      }
    } catch (error) {
      this.logger.error(`Error fetching previous events for ${config.name}: ${error.message}`);
    }
  }

  private async fetchAndStoreContractEvents(
    web3: Web3,
    chainName: string,
    contract: ContractConfig,
    fromBlock: number,
    toBlock: number
  ): Promise<void> {
    try {
      const batchSize = 1000;
      
      for (let block = fromBlock; block <= toBlock; block += batchSize) {
        const endBlock = Math.min(block + batchSize - 1, toBlock);
        
        this.logger.log(`Fetching events for ${contract.name} on ${chainName} from block ${block} to ${endBlock}`);

        const depositedEvents = await web3.eth.getPastLogs({
          address: contract.address,
          fromBlock: web3.utils.toHex(block),
          toBlock: web3.utils.toHex(endBlock),
          topics: [web3.utils.sha3('Deposited(address,address,address,uint256,uint256,uint256)') || '']
        });

        const redeemedEvents = await web3.eth.getPastLogs({
          address: contract.address,
          fromBlock: web3.utils.toHex(block),
          toBlock: web3.utils.toHex(endBlock),
          topics: [web3.utils.sha3('Redeemed(address,address,address,uint256,uint256,uint256)') || '']
        });

        for (const log of depositedEvents) {
          await this.processDepositedEvent(chainName, contract, log, web3);
        }

        for (const log of redeemedEvents) {
          await this.processRedeemedEvent(chainName, contract, log, web3);
        }

        this.logger.log(`Processed ${depositedEvents.length} deposited and ${redeemedEvents.length} redeemed events for ${contract.name}`);
      }
    } catch (error) {
      this.logger.error(`Error fetching events for ${contract.name} on ${chainName}: ${error.message}`);
    }
  }

  getChainConnectionStatus(): Map<string, boolean> {
    const status = new Map<string, boolean>();
    
    for (const [chainName, web3] of this.web3Connections) {
      const provider = web3.provider as any;
      status.set(chainName, provider?.connected || false);
    }
    
    return status;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getWeb3Instance(chainName: string): Web3 | undefined {
    return this.web3Connections.get(chainName);
  }

  async disconnect(): Promise<void> {
    this.logger.log('Disconnecting');
    
    for (const [key, subscription] of this.subscriptions) {
      try {
        await subscription.unsubscribe();
      } catch (error) {
        this.logger.warn(`Error unsubscribing from ${key}:`, error);
      }
    }
    
    for (const [chainName, web3] of this.web3Connections) {
      try {
        const provider = web3.provider as any;
        if (provider?.disconnect) {
          await provider.disconnect();
        }
        this.logger.log(`Disconnected from ${chainName}`);
      } catch (error) {
        this.logger.warn(`Error disconnecting from ${chainName}:`, error);
      }
    }
    
    this.subscriptions.clear();
    this.web3Connections.clear();
    this.connected = false;
  }

  async onModuleDestroy() {
    await this.disconnect();
  }
}
