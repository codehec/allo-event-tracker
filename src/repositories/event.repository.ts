import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Event } from '../entities/event.entity';

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
  chainName: string;
  eventType: string;
  contractAddress: string;
  txHash: string;
  blockNumber: number;
  assetToken: string;
  stablecoin: string;
  amount: string;
  tokenAmount: string;
  fee: string;
  timestamp: string;
  date: Date;
  createdAt: Date;
}

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.repository.create(eventData);
    return await this.repository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return await this.repository.find();
  }

  async findByTxHash(txHash: string): Promise<Event | null> {
    return await this.repository.findOne({ where: { tx_hash: txHash } });
  }

  async getDailyTokenAmounts(
    chainName: string,
    assetTokenAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DailyTokenAmounts[]> {
    const whereConditions: any = {
      chain_name: chainName,
      asset_token: ILike(assetTokenAddress),
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount', 'date']
    });

    const dailyMap = new Map<string, { minted: bigint; redeemed: bigint }>();

    events.forEach(event => {
      const date = event.date.toISOString().split('T')[0];
      const amount = BigInt(event.token_amount || '0');
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { minted: BigInt(0), redeemed: BigInt(0) });
      }
      
      const daily = dailyMap.get(date)!;
      if (event.event_type === 'deposited') {
        daily.minted += amount;
      } else if (event.event_type === 'redeemed') {
        daily.redeemed += amount;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, amounts]) => ({
        date,
        mintedAmount: amounts.minted.toString(),
        redeemedAmount: amounts.redeemed.toString()
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTokenSummary(
    chainName: string,
    assetTokenAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalMinted: string;
    totalRedeemed: string;
    totalEvents: number;
  }> {
    const whereConditions: any = {
      chain_name: chainName,
      asset_token: ILike(assetTokenAddress),
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);

    events.forEach(event => {
      const amount = BigInt(event.token_amount || '0');
      if (event.event_type === 'deposited') {
        totalMinted += amount;
      } else if (event.event_type === 'redeemed') {
        totalRedeemed += amount;
      }
    });

    return {
      totalMinted: totalMinted.toString(),
      totalRedeemed: totalRedeemed.toString(),
      totalEvents: events.length
    };
  }

  async getWalletEvents(
    chainName: string,
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
      chain_name: chainName,
      user: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
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
        chainName: event.chain_name,
        eventType: event.event_type,
        contractAddress: event.contract_address,
        txHash: event.tx_hash,
        blockNumber: event.block_number,
        assetToken: event.asset_token,
        stablecoin: event.stablecoin,
        amount: event.amount,
        tokenAmount: event.token_amount,
        fee: event.fee,
        timestamp: event.timestamp,
        date: event.date,
        createdAt: event.created_at
      })),
      total
    };
  }

  async getWalletSummary(
    chainName: string,
    walletAddress: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<WalletEventSummary> {
    const whereConditions: any = {
      chain_name: chainName,
      user: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount', 'fee', 'asset_token', 'stablecoin']
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
      const amount = BigInt(event.token_amount || '0');
      const fee = BigInt(event.fee || '0');
      
      if (event.event_type === 'deposited') {
        totalMinted += amount;
      } else if (event.event_type === 'redeemed') {
        totalRedeemed += amount;
      }
      
      totalFees += fee;
      uniqueTokens.add(event.asset_token);
      uniqueStablecoins.add(event.stablecoin);

      if (!assetMap.has(event.asset_token)) {
        assetMap.set(event.asset_token, {
          minted: BigInt(0),
          redeemed: BigInt(0),
          fees: BigInt(0),
          events: 0
        });
      }
      
      const asset = assetMap.get(event.asset_token)!;
      asset.events++;
      asset.fees += fee;
      
      if (event.event_type === 'deposited') {
        asset.minted += amount;
      } else if (event.event_type === 'redeemed') {
        asset.redeemed += amount;
      }
    });

    const assets = Array.from(assetMap.entries())
      .map(([assetTokenAddress, data]) => ({
        assetTokenAddress,
        totalMinted: data.minted.toString(),
        totalRedeemed: data.redeemed.toString(),
        totalEvents: data.events,
        totalFees: data.fees.toString()
      }))
      .sort((a, b) => {
        const aTotal = BigInt(a.totalMinted) + BigInt(a.totalRedeemed);
        const bTotal = BigInt(b.totalMinted) + BigInt(b.totalRedeemed);
        return aTotal > bTotal ? -1 : aTotal < bTotal ? 1 : 0;
      });

    return {
      totalMinted: totalMinted.toString(),
      totalRedeemed: totalRedeemed.toString(),
      totalFees: totalFees.toString(),
      totalEvents: events.length,
      uniqueTokens: uniqueTokens.size,
      uniqueStablecoins: uniqueStablecoins.size,
      assets
    };
  }

  async getWalletDailyActivity(
    chainName: string,
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
      chain_name: chainName,
      user: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount', 'fee', 'date']
    });

    const dailyMap = new Map<string, { 
      minted: bigint; 
      redeemed: bigint; 
      fees: bigint; 
      count: number 
    }>();

    events.forEach(event => {
      const date = event.date.toISOString().split('T')[0];
      const amount = BigInt(event.token_amount || '0');
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
      
      if (event.event_type === 'deposited') {
        daily.minted += amount;
      } else if (event.event_type === 'redeemed') {
        daily.redeemed += amount;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        mintedAmount: data.minted.toString(),
        redeemedAmount: data.redeemed.toString(),
        totalFees: data.fees.toString(),
        eventCount: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTotalFeesCollected(
    chainName: string,
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
      chain_name: chainName
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    if (assetTokenAddress) {
      whereConditions.asset_token = ILike(assetTokenAddress);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['fee', 'date', 'asset_token']
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
      totalFees: totalFees.toString(),
      totalEvents: events.length,
      assetTokenAddress,
      dailyFees
    };
  }

  async getAggregatedAnalytics(
    chainName: string,
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
      chain_name: chainName
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    }

    if (assetTokenAddress) {
      whereConditions.asset_token = ILike(assetTokenAddress);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount', 'fee', 'user', 'asset_token']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);
    let totalFees = BigInt(0);
    const uniqueWallets = new Set<string>();
    const uniqueTokens = new Set<string>();

    events.forEach(event => {
      const amount = BigInt(event.token_amount || '0');
      const fee = BigInt(event.fee || '0');
      
      if (event.event_type === 'deposited') {
        totalMinted += amount;
      } else if (event.event_type === 'redeemed') {
        totalRedeemed += amount;
      }
      
      totalFees += fee;
      uniqueWallets.add(event.user);
      uniqueTokens.add(event.asset_token);
    });

    return {
      totalTokensMinted: totalMinted.toString(),
      totalTokensRedeemed: totalRedeemed.toString(),
      totalEvents: events.length,
      totalFees: totalFees.toString(),
      uniqueWallets: uniqueWallets.size,
      uniqueTokens: uniqueTokens.size,
      uniqueWalletsList: Array.from(uniqueWallets),
      uniqueTokensList: Array.from(uniqueTokens)
    };
  }

  async getUserTransactionHistory(
    chainName: string,
    walletAddress: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    transactions: Array<{
      id: string;
      eventType: string;
      txHash: string;
      blockNumber: number;
      assetToken: string;
      stablecoin: string;
      amount: string;
      tokenAmount: string;
      fee: string;
      timestamp: string;
      date: string;
    }>;
    total: number;
  }> {
    const whereConditions: any = {
      chain_name: chainName,
      user: ILike(walletAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    const [transactions, total] = await this.repository.findAndCount({
      where: whereConditions,
      order: { date: 'DESC' },
      skip: offset,
      take: limit
    });

    return {
      transactions: transactions.map(event => ({
        id: event.id,
        eventType: event.event_type,
        txHash: event.tx_hash,
        blockNumber: event.block_number,
        assetToken: event.asset_token,
        stablecoin: event.stablecoin,
        amount: event.amount,
        tokenAmount: event.token_amount,
        fee: event.fee,
        timestamp: event.timestamp,
        date: event.date.toISOString()
      })),
      total
    };
  }

  async getTokenActivitySummary(
    chainName: string,
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
  }> {
    const whereConditions: any = {
      chain_name: chainName,
      asset_token: ILike(assetTokenAddress),
      stablecoin: ILike(stablecoinAddress)
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['event_type', 'token_amount', 'fee', 'user']
    });

    let totalMinted = BigInt(0);
    let totalRedeemed = BigInt(0);
    let totalFees = BigInt(0);
    const uniqueWallets = new Set<string>();

    events.forEach(event => {
      const amount = BigInt(event.token_amount || '0');
      const fee = BigInt(event.fee || '0');
      
      if (event.event_type === 'deposited') {
        totalMinted += amount;
      } else if (event.event_type === 'redeemed') {
        totalRedeemed += amount;
      }
      
      totalFees += fee;
      uniqueWallets.add(event.user);
    });

    return {
      totalMinted: totalMinted.toString(),
      totalRedeemed: totalRedeemed.toString(),
      totalEvents: events.length,
      totalFees: totalFees.toString(),
      uniqueWallets: uniqueWallets.size
    };
  }

  async getTopUsers(
    chainName: string,
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
      chain_name: chainName,
      asset_token: ILike(assetTokenAddress),
      event_type: type === 'depositors' ? 'deposited' : 'redeemed'
    };

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    const events = await this.repository.find({
      where: whereConditions,
      select: ['user', 'token_amount', 'fee']
    });

    const userMap = new Map<string, { amount: bigint; events: number; fees: bigint }>();

    events.forEach(event => {
      const amount = BigInt(event.token_amount || '0');
      const fee = BigInt(event.fee || '0');
      
      if (!userMap.has(event.user)) {
        userMap.set(event.user, { amount: BigInt(0), events: 0, fees: BigInt(0) });
      }
      
      const user = userMap.get(event.user)!;
      user.amount += amount;
      user.events++;
      user.fees += fee;
    });

    return Array.from(userMap.entries())
      .map(([walletAddress, data]) => ({
        walletAddress,
        totalAmount: data.amount.toString(),
        totalEvents: data.events,
        totalFees: data.fees.toString()
      }))
      .sort((a, b) => {
        const aAmount = BigInt(a.totalAmount);
        const bAmount = BigInt(b.totalAmount);
        return aAmount > bAmount ? -1 : aAmount < bAmount ? 1 : 0;
      })
      .slice(0, limit);
  }

  async getFilteredEvents(
    chainName: string,
    assetTokenAddress?: string,
    walletAddress?: string,
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
    startBlock?: number,
    endBlock?: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    events: Array<{
      id: string;
      chainName: string;
      eventType: string;
      contractAddress: string;
      txHash: string;
      blockNumber: number;
      user: string;
      assetToken: string;
      stablecoin: string;
      amount: string;
      tokenAmount: string;
      fee: string;
      timestamp: string;
      date: string;
    }>;
    total: number;
  }> {
    const whereConditions: any = {
      chain_name: chainName
    };

    if (assetTokenAddress) {
      whereConditions.asset_token = ILike(assetTokenAddress);
    }

    if (walletAddress) {
      whereConditions.user = ILike(walletAddress);
    }

    if (eventType) {
      whereConditions.event_type = eventType;
    }

    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = Between(startDate, new Date());
    } else if (endDate) {
      whereConditions.date = Between(new Date(0), endDate);
    }

    if (startBlock && endBlock) {
      whereConditions.block_number = Between(startBlock, endBlock);
    } else if (startBlock) {
      whereConditions.block_number = MoreThanOrEqual(startBlock);
    } else if (endBlock) {
      whereConditions.block_number = LessThanOrEqual(endBlock);
    }

    const [events, total] = await this.repository.findAndCount({
      where: whereConditions,
      order: { date: 'DESC' },
      skip: offset,
      take: limit
    });

    return {
      events: events.map(event => ({
        id: event.id,
        chainName: event.chain_name,
        eventType: event.event_type,
        contractAddress: event.contract_address,
        txHash: event.tx_hash,
        blockNumber: event.block_number,
        user: event.user,
        assetToken: event.asset_token,
        stablecoin: event.stablecoin,
        amount: event.amount,
        tokenAmount: event.token_amount,
        fee: event.fee,
        timestamp: event.timestamp,
        date: event.date.toISOString()
      })),
      total
    };
  }


} 