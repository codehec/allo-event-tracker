export interface DailyTokenAmountsResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress: string;
    startDate?: string;
    endDate?: string;
    dailyAmounts: Array<{
      date: string;
      mintedAmount: string;
      redeemedAmount: string;
    }>;
    totalDays: number;
  };
  message?: string;
  error?: string;
}

export interface TokenSummaryResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress: string;
    startDate?: string;
    endDate?: string;
    summary: {
      totalMinted: string;
      totalRedeemed: string;
      totalEvents: number;
    };
  };
  message?: string;
  error?: string;
}

export interface WalletEventsResponse {
  success: boolean;
  data?: {
    chainName: string;
    walletAddress: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
    events: Array<{
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
      createdAt: string;
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  message?: string;
  error?: string;
}

export interface WalletSummaryResponse {
  success: boolean;
  data?: {
    chainName: string;
    walletAddress: string;
    startDate?: string;
    endDate?: string;
    summary: {
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
    };
  };
  message?: string;
  error?: string;
}

export interface WalletDailyActivityResponse {
  success: boolean;
  data?: {
    chainName: string;
    walletAddress: string;
    startDate?: string;
    endDate?: string;
    dailyActivity: Array<{
      date: string;
      mintedAmount: string;
      redeemedAmount: string;
      totalFees: string;
      eventCount: number;
    }>;
    totalDays: number;
  };
  message?: string;
  error?: string;
}

export interface TotalFeesCollectedResponse {
  success: boolean;
  data?: {
    chainName: string;
    startDate: string;
    endDate: string;
    assetTokenAddress?: string;
    totalFees: string;
    totalEvents: number;
    dailyFees: Array<{
      date: string;
      totalFees: string;
      eventCount: number;
    }>;
    totalDays: number;
  };
  message?: string;
  error?: string;
}

export interface AggregatedAnalyticsResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress?: string;
    startDate?: string;
    endDate?: string;
    analytics: {
      totalTokensMinted: string;
      totalTokensRedeemed: string;
      totalEvents: number;
      totalFees: string;
      uniqueWallets: number;
      uniqueTokens: number;
      uniqueWalletsList: string[];
      uniqueTokensList: string[];
    };
  };
  message?: string;
  error?: string;
}

export interface UserTransactionHistoryResponse {
  success: boolean;
  data?: {
    chainName: string;
    walletAddress: string;
    startDate?: string;
    endDate?: string;
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
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  message?: string;
  error?: string;
}

export interface TokenActivitySummaryResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress: string;
    stablecoinAddress: string;
    startDate?: string;
    endDate?: string;
    summary: {
      totalMinted: string;
      totalRedeemed: string;
      totalEvents: number;
      totalFees: string;
      uniqueWallets: number;
    };
  };
  message?: string;
  error?: string;
}

export interface TopUsersResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress: string;
    type: string;
    startDate?: string;
    endDate?: string;
    users: Array<{
      walletAddress: string;
      totalAmount: string;
      totalEvents: number;
      totalFees: string;
    }>;
    totalUsers: number;
  };
  message?: string;
  error?: string;
}

export interface FilteredEventsResponse {
  success: boolean;
  data?: {
    chainName: string;
    assetTokenAddress?: string;
    walletAddress?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    startBlock?: number;
    endBlock?: number;
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
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  message?: string;
  error?: string;
}

 