import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { StockManagerEvent } from '../entities/stock_manager_events';
import Web3 from 'web3';

export interface DailyTokenAmounts {
  date: string;
  mintedAmount: string;
  redeemedAmount: string;
}

export interface WalletEventSummary {
  totalMinted: string;
  totalRedeemed: string;
  totalEvents: number;
  totalFees: string;
  uniqueTokens: number;
  uniqueStablecoins: number;
  assets: Array<{
    assetTokenAddress: string;
    totalMinted: string;
    totalRedeemed: string;
    totalEvents: number;
    totalFees: string;
  }>;
}

export interface WalletEvent {
  id: string;
  network: string;
  eventType: string;
  assetTokenAddress: string;
  stablecoinAddress: string;
  txHash: string;
  blockNumber: number;
  walletAddress: string;
  amountDeposited: string;
  tokensMinted: string;
  tokensRedeemed: string;
  amountReturned: string;
  fee: string;
  timestamp: string;
  date: Date;
  createdAt: Date;
}

@Injectable()
export class StockManagerEventRepository {
  constructor(
    @InjectRepository(StockManagerEvent)
    private readonly repository: Repository<StockManagerEvent>,
  ) {}

  async create(eventData: Partial<StockManagerEvent>): Promise<StockManagerEvent> {
    const event = this.repository.create(eventData);
    return await this.repository.save(event);
  }

  async findAll(): Promise<StockManagerEvent[]> {
    return await this.repository.find();
  }

  async findByTxHash(txHash: string): Promise<StockManagerEvent | null> {
    return await this.repository.findOne({ where: { transaction_hash: txHash } });
  }

  async getDailyTokenAmounts(
    network: string,
    assetTokenAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DailyTokenAmounts[]> {

    const whereConditions: any = {
      network: network,
      asset_token_address: ILike(assetTokenAddress),
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'tokens_minted', 'tokens_redeemed', 'date', 'asset_token_address', 'network']
    });

    const dailyMap = new Map<string, { minted: bigint; redeemed: bigint }>();

    events.forEach(event => {
      const date = event.date.toISOString().split('T')[0];
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { minted: BigInt(0), redeemed: BigInt(0) });
      }
      
      const daily = dailyMap.get(date)!;
      daily.minted += mintedAmount;
      daily.redeemed += redeemedAmount;
    });

    return Array.from(dailyMap.entries())
      .map(([date, amounts]) => ({
        date,
        mintedAmount: Web3.utils.fromWei(amounts.minted.toString(), 'ether'),
        redeemedAmount: Web3.utils.fromWei(amounts.redeemed.toString(), 'ether')
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTokenSummary(
    network: string,
    assetTokenAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalMinted: string;
    totalRedeemed: string;
    totalEvents: number;
  }> {
    const whereConditions: any = {
      network: network,
      asset_token_address: ILike(assetTokenAddress),
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);

    events.forEach(event => {
      totalMinted += BigInt(event.tokens_minted || '0');
      totalRedeemed += BigInt(event.tokens_redeemed || '0');
    });

    return {
      totalMinted: Web3.utils.fromWei(totalMinted.toString(), 'ether'),
      totalRedeemed: Web3.utils.fromWei(totalRedeemed.toString(), 'ether'),
      totalEvents: events.length
    };
  }

  async getWalletEvents(
    network: string,
    walletAddress: string,
    startDate?: Date,
    endDate?: Date,
    eventType?: string,
    limit?: number,
    offset?: number
  ): Promise<{
    events: WalletEvent[];
    total: number;
  }> {
    const whereConditions: any = {
      network: network,
      wallet_address: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    if (eventType) {
      whereConditions.event_type = eventType;
    }

    const [events, total] = await this.repository.findAndCount({
      where: whereConditions,
      order: { date: 'DESC' },
      skip: offset || 0,
      take: limit || 50
    });

    return {
      events: events.map(event => ({
        id: event.id,
        network: event.network,
        eventType: event.event_type,
        assetTokenAddress: event.asset_token_address,
        stablecoinAddress: event.stablecoin_address,
        txHash: event.transaction_hash,
        blockNumber: event.block_number,
        walletAddress: event.wallet_address,
        amountDeposited: Web3.utils.fromWei(event.amount_deposited, 'ether'),
        tokensMinted: Web3.utils.fromWei(event.tokens_minted, 'ether'),
        tokensRedeemed: Web3.utils.fromWei(event.tokens_redeemed, 'ether'),
        amountReturned: Web3.utils.fromWei(event.amount_returned, 'ether'),
        fee: Web3.utils.fromWei(event.fee, 'ether'),
        timestamp: event.timestamp,
        date: event.date,
        createdAt: event.created_at
      })),
      total
    };
  }

  async getWalletSummary(
    network: string,
    walletAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WalletEventSummary> {
    const whereConditions: any = {
      network: network,
      wallet_address: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed', 'fee', 'asset_token_address', 'stablecoin_address']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);
    let totalFees = BigInt(0);
    const uniqueTokens = new Set<string>();
    const uniqueStablecoins = new Set<string>();
    const assetMap = new Map<string, {
      minted: bigint;
      redeemed: bigint;
      fees: bigint;
      events: number;
    }>();

    events.forEach(event => {
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      const fee = BigInt(event.fee || '0');
      
      totalMinted += mintedAmount;
      totalRedeemed += redeemedAmount;
      totalFees += fee;
      uniqueTokens.add(event.asset_token_address);
      uniqueStablecoins.add(event.stablecoin_address);

      if (!assetMap.has(event.asset_token_address)) {
        assetMap.set(event.asset_token_address, {
          minted: BigInt(0),
          redeemed: BigInt(0),
          fees: BigInt(0),
          events: 0
        });
      }
      
      const asset = assetMap.get(event.asset_token_address)!;
      asset.events++;
      asset.fees += fee;
      asset.minted += mintedAmount;
      asset.redeemed += redeemedAmount;
    });

    const assets = Array.from(assetMap.entries())
      .map(([assetTokenAddress, data]) => ({
        assetTokenAddress,
        totalMinted: Web3.utils.fromWei(data.minted.toString(), 'ether'),
        totalRedeemed: Web3.utils.fromWei(data.redeemed.toString(), 'ether'),
        totalEvents: data.events,
        totalFees: Web3.utils.fromWei(data.fees.toString(), 'ether')
      }))
      .sort((a, b) => {
        const aTotal = BigInt(a.totalMinted) + BigInt(a.totalRedeemed);
        const bTotal = BigInt(b.totalMinted) + BigInt(b.totalRedeemed);
        return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
      });

    return {
      totalMinted: Web3.utils.fromWei(totalMinted.toString(), 'ether'),
      totalRedeemed: Web3.utils.fromWei(totalRedeemed.toString(), 'ether'),
      totalFees: Web3.utils.fromWei(totalFees.toString(), 'ether'),
      totalEvents: events.length,
      uniqueTokens: uniqueTokens.size,
      uniqueStablecoins: uniqueStablecoins.size,
      assets
    };
  }

  async getWalletDailyActivity(
    network: string,
    walletAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{
    date: string;
    mintedAmount: string;
    redeemedAmount: string;
    totalFees: string;
    eventCount: number;
  }>> {
    const whereConditions: any = {
      network: network,
      wallet_address: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed', 'fee', 'date']
    });

    const dailyMap = new Map<string, { 
      minted: bigint; 
      redeemed: bigint; 
      fees: bigint; 
      count: number 
    }>();

    events.forEach(event => {
      const date = event.date.toISOString().split('T')[0];
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      const fee = BigInt(event.fee || '0');
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { 
          minted: BigInt(0), 
          redeemed: BigInt(0), 
          fees: BigInt(0), 
          count: 0 
        });
      }
      
      const daily = dailyMap.get(date)!;
      daily.count++;
      daily.fees += fee;
      daily.minted += mintedAmount;
      daily.redeemed += redeemedAmount;
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        mintedAmount: Web3.utils.fromWei(data.minted.toString(), 'ether'),
        redeemedAmount: Web3.utils.fromWei(data.redeemed.toString(), 'ether'),
        totalFees: Web3.utils.fromWei(data.fees.toString(), 'ether'),
        eventCount: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTotalFeesCollected(
    network: string,
    startDate?: Date,
    endDate?: Date,
    assetTokenAddress?: string
  ): Promise<{
    totalFees: string;
    totalEvents: number;
    assetTokenAddress?: string;
    dailyFees: Array<{
      date: string;
      totalFees: string;
      eventCount: number;
    }>;
  }> {
    const whereConditions: any = {
      network: network
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    if (assetTokenAddress) {
      whereConditions.asset_token_address = ILike(assetTokenAddress);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['fee', 'date', 'asset_token_address']
    });

    let totalFees = BigInt(0);
    const dailyMap = new Map<string, { fees: bigint; count: number }>();

    events.forEach(event => {
      const fee = BigInt(event.fee || '0');
      totalFees += fee;
      
      const date = event.date.toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { fees: BigInt(0), count: 0 });
      }
      
      const daily = dailyMap.get(date)!;
      daily.fees += fee;
      daily.count++;
    });

    const dailyFees = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        totalFees: data.fees.toString(),
        eventCount: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalFees: Web3.utils.fromWei(totalFees.toString(), 'ether'),
      totalEvents: events.length,
      assetTokenAddress,
      dailyFees
    };
  }

  async getAggregatedAnalytics(
    network: string,
    startDate?: Date,
    endDate?: Date,
    assetTokenAddress?: string
  ): Promise<{
    totalTokensMinted: string;
    totalTokensRedeemed: string;
    totalEvents: number;
    totalFees: string;
    uniqueWallets: number;
    uniqueTokens: number;
    uniqueWalletsList: string[];
    uniqueTokensList: string[];
  }> {
    const whereConditions: any = {
      network: network
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    if (assetTokenAddress) {
      whereConditions.asset_token_address = ILike(assetTokenAddress);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed', 'fee', 'wallet_address', 'asset_token_address']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);
    let totalFees = BigInt(0);
    const uniqueWallets = new Set<string>();
    const uniqueTokens = new Set<string>();

    events.forEach(event => {
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      const fee = BigInt(event.fee || '0');
      
      totalMinted += mintedAmount;
      totalRedeemed += redeemedAmount;
      totalFees += fee;
      uniqueWallets.add(event.wallet_address);
      uniqueTokens.add(event.asset_token_address);
    });

    return {
      totalTokensMinted: Web3.utils.fromWei(totalMinted.toString(), 'ether'),
      totalTokensRedeemed: Web3.utils.fromWei(totalRedeemed.toString(), 'ether'),
      totalEvents: events.length,
      totalFees: Web3.utils.fromWei(totalFees.toString(), 'ether'),
      uniqueWallets: uniqueWallets.size,
      uniqueTokens: uniqueTokens.size,
      uniqueWalletsList: Array.from(uniqueWallets),
      uniqueTokensList: Array.from(uniqueTokens)
    };
  }

  async getTokenActivitySummary(
    network: string,
    assetTokenAddress: string,
    stablecoinAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalMinted: string;
    totalRedeemed: string;
    totalEvents: number;
    totalFees: string;
    uniqueWallets: number;
    uniqueWalletAddresses: string[];
  }> {
    const whereConditions: any = {
      network: network,
      asset_token_address: ILike(assetTokenAddress),
      stablecoin_address: ILike(stablecoinAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed', 'fee', 'wallet_address']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);
    let totalFees = BigInt(0);
    const uniqueWallets = new Set<string>();

    events.forEach(event => {
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      const fee = BigInt(event.fee || '0');
      
      totalMinted += mintedAmount;
      totalRedeemed += redeemedAmount;
      totalFees += fee;
      uniqueWallets.add(event.wallet_address);
    });

    return {
      totalMinted: Web3.utils.fromWei(totalMinted.toString(), 'ether'),
      totalRedeemed: Web3.utils.fromWei(totalRedeemed.toString(), 'ether'),
      totalEvents: events.length,
      totalFees: Web3.utils.fromWei(totalFees.toString(), 'ether'),
      uniqueWallets: uniqueWallets.size,
      uniqueWalletAddresses: Array.from(uniqueWallets)
    };
  }

  async getTopUsers(
    network: string,
    assetTokenAddress: string,
    type: 'depositors' | 'redeemers',
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<Array<{
    walletAddress: string;
    totalAmount: string;
    totalEvents: number;
    totalFees: string;
  }>> {
    const whereConditions: any = {
      network: network,
      asset_token_address: ILike(assetTokenAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    if (type === 'depositors') {
      whereConditions.tokens_minted = MoreThanOrEqual('1');
    } else if (type === 'redeemers') {
      whereConditions.tokens_redeemed = MoreThanOrEqual('1');
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['tokens_minted', 'tokens_redeemed', 'fee', 'wallet_address']
    });

    const walletMap = new Map<string, {
      minted: bigint;
      redeemed: bigint;
      fees: bigint;
      events: number;
    }>();

    events.forEach(event => {
      const mintedAmount = BigInt(event.tokens_minted || '0');
      const redeemedAmount = BigInt(event.tokens_redeemed || '0');
      const fee = BigInt(event.fee || '0');
      
      if (!walletMap.has(event.wallet_address)) {
        walletMap.set(event.wallet_address, {
          minted: BigInt(0),
          redeemed: BigInt(0),
          fees: BigInt(0),
          events: 0
        });
      }
      
      const wallet = walletMap.get(event.wallet_address)!;
      wallet.minted += mintedAmount;
      wallet.redeemed += redeemedAmount;
      wallet.fees += fee;
      wallet.events++;
    });

    const topUsers = Array.from(walletMap.entries())
      .map(([walletAddress, data]) => ({
        walletAddress,
        totalAmount: type === 'depositors' 
          ? Web3.utils.fromWei(data.minted.toString(), 'ether')
          : Web3.utils.fromWei(data.redeemed.toString(), 'ether'),
        totalEvents: data.events,
        totalFees: Web3.utils.fromWei(data.fees.toString(), 'ether')
      }))
      .sort((a, b) => {
        const aAmount = parseFloat(a.totalAmount);
        const bAmount = parseFloat(b.totalAmount);
        return bAmount - aAmount;
      })
      .slice(0, limit);

    return topUsers;
  }

} 