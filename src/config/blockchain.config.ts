import { BlockchainConfig } from '../web3/web3.service';

export const blockchainConfigs: BlockchainConfig[] = [
  {
    name: 'bsc',
    wssUrl: process.env.BSC_WSS_RPC || 'wss://bsc-rpc.publicnode.com',
    chainId: 56,
    contracts: [
      {
        address: '0x85d48bad5c2db86d53fc85b52b75109d17be0c4e',
        name: 'AlloStocksManager'
      }
    ]
  },
]; 