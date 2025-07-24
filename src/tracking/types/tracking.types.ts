export interface DailyTokenAmounts {
  date: string;
  mintedAmount: string;
  redeemedAmount: string;
}

export interface TokenSummary {
  totalMinted: string;
  totalRedeemed: string;
  totalEvents: number;
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

export interface WalletDailyActivity {
  date: string;
  mintedAmount: string;
  redeemedAmount: string;
  totalFees: string;
  eventCount: number;
}

export interface TotalFeesCollected {
  totalFees: string;
  totalEvents: number;
  assetTokenAddress?: string;
  dailyFees: Array<{
    date: string;
    totalFees: string;
    eventCount: number;
  }>;
}

export interface AggregatedAnalytics {
  totalTokensMinted: string;
  totalTokensRedeemed: string;
  totalEvents: number;
  totalFees: string;
  uniqueWallets: number;
  uniqueTokens: number;
  uniqueWalletsList: string[];
  uniqueTokensList: string[];
}

export interface UserTransaction {
  id: string;
  eventType: string;
  txHash: string;
  blockNumber: number;
  assetTokenAddress: string;
  stablecoinAddress: string;
  amountDeposited: string;
  tokensMinted: string;
  tokensRedeemed: string;
  amountReturned: string;
  fee: string;
  timestamp: string;
  date: string;
}

export interface UserTransactionHistory {
  transactions: UserTransaction[];
  total: number;
}

export interface TokenActivitySummary {
  totalMinted: string;
  totalRedeemed: string;
  totalEvents: number;
  totalFees: string;
  uniqueWallets: number;
  uniqueWalletAddresses: string[];
}

export interface TopUser {
  walletAddress: string;
  totalAmount: string;
  totalEvents: number;
  totalFees: string;
}

export interface FilteredEvent {
  id: string;
  network: string;
  eventType: string;
  txHash: string;
  blockNumber: number;
  walletAddress: string;
  assetTokenAddress: string;
  stablecoinAddress: string;
  amountDeposited: string;
  tokensMinted: string;
  tokensRedeemed: string;
  amountReturned: string;
  fee: string;
  timestamp: string;
  date: string;
}

export interface FilteredEventsResponse {
  events: FilteredEvent[];
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  limit: number;
  offset: number;
  message: string;
}

export type EventType = 'deposited' | 'redeemed';

export type UserType = 'depositors' | 'redeemers';

export type NetworkType = 'bsc' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism';

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface BlockRange {
  startBlock?: number;
  endBlock?: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface BaseQueryParams {
  chainName: string;
}

export interface TokenQueryParams extends BaseQueryParams {
  assetTokenAddress: string;
}

export interface WalletQueryParams extends BaseQueryParams {
  walletAddress: string;
}

export interface DateQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface EventFilterParams {
  eventType?: EventType;
  assetTokenAddress?: string;
}

export interface BlockFilterParams {
  startBlock?: number;
  endBlock?: number;
}

export interface DailyTokenAmountsParams extends TokenQueryParams, DateQueryParams {}

export interface TokenSummaryParams extends TokenQueryParams, DateQueryParams {}

export interface WalletEventsParams extends WalletQueryParams, DateQueryParams, EventFilterParams, PaginationParams {}

export interface WalletSummaryParams extends WalletQueryParams, DateQueryParams {}

export interface WalletDailyActivityParams extends WalletQueryParams, DateQueryParams {}

export interface TotalFeesCollectedParams extends BaseQueryParams, DateQueryParams {
  assetTokenAddress?: string;
}

export interface AggregatedAnalyticsParams extends BaseQueryParams, DateQueryParams {
  assetTokenAddress?: string;
}

export interface UserTransactionHistoryParams extends WalletQueryParams, DateQueryParams, PaginationParams {}

export interface TokenActivitySummaryParams extends TokenQueryParams, DateQueryParams {
  stablecoinAddress: string;
}

export interface TopUsersParams extends TokenQueryParams, DateQueryParams {
  type: UserType;
  limit?: number;
}

export interface FilteredEventsParams extends BaseQueryParams, DateQueryParams, EventFilterParams, BlockFilterParams, PaginationParams {}
