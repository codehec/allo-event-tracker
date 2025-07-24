import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockManagerEventRepository } from '../repositories/stock_manager_events.repository';
import { 
  GetDailyTokenAmountsDto,
  GetTokenSummaryDto,
  GetWalletEventsDto,
  GetWalletSummaryDto,
  GetWalletDailyActivityDto,
  GetTotalFeesCollectedDto,
  GetAggregatedAnalyticsDto,
  GetUserTransactionHistoryDto,
  GetTokenActivitySummaryDto,
  GetTopUsersDto,
  GetFilteredEventsDto
} from './dto/tracking.dto';
import { 
  ApiResponse as ApiResponseType,
  DailyTokenAmounts,
  TokenSummary,
  WalletEventSummary,
  WalletDailyActivity,
  TotalFeesCollected,
  AggregatedAnalytics,
  UserTransactionHistory,
  TokenActivitySummary,
  TopUser,
  FilteredEventsResponse
} from './types/tracking.types';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly stockManagerEventRepository: StockManagerEventRepository,
  ) {}

  @Get('daily-token-amounts')
  @ApiOperation({
    summary: 'Get daily token amounts minted and redeemed for a specific token',
    description: 'Retrieves daily aggregated data of tokens minted and redeemed for a given asset token address within an optional date range.'
  })
  @ApiResponse({
    status: 200,
    description: 'Daily token amounts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2024-01-15' },
              mintedAmount: { type: 'string', example: '1000000000000000000000' },
              redeemedAmount: { type: 'string', example: '500000000000000000000' }
            }
          }
        },
        message: { type: 'string', example: 'Daily token amounts retrieved successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getDailyTokenAmounts(
    @Query(new ValidationPipe({ transform: true })) query: GetDailyTokenAmountsDto
  ): Promise<ApiResponseType<DailyTokenAmounts[]>> {
    try {
      const { chainName, assetTokenAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const dailyAmounts = await this.stockManagerEventRepository.getDailyTokenAmounts(
        chainName,
        assetTokenAddress,
        startDateObj,
        endDateObj
      );

      return {
        success: true,
        data: dailyAmounts,
        message: 'Daily token amounts retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to retrieve daily token amounts'
      };
    }
  }

  @Get('token-summary')
  @ApiOperation({
    summary: 'Get token summary for a specific token',
    description: 'Retrieves summary statistics for a given asset token address including total minted, redeemed, and event count.'
  })
  @ApiResponse({
    status: 200,
    description: 'Token summary retrieved successfully'
  })
  async getTokenSummary(
    @Query(new ValidationPipe({ transform: true })) query: GetTokenSummaryDto
  ): Promise<ApiResponseType<TokenSummary>> {
    try {
      const { chainName, assetTokenAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const summary = await this.stockManagerEventRepository.getTokenSummary(
        chainName,
        assetTokenAddress,
        startDateObj,
        endDateObj
      );

      return {
        success: true,
        data: summary,
        message: 'Token summary retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: { totalMinted: '0', totalRedeemed: '0', totalEvents: 0 },
        message: error.message || 'Failed to retrieve token summary'
      };
    }
  }

  @Get('wallet-events')
  @ApiOperation({
    summary: 'Get wallet events for a specific wallet address',
    description: 'Retrieves all events for a given wallet address with optional filtering and pagination.'
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet events retrieved successfully'
  })
  async getWalletEvents(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletEventsDto
  ): Promise<ApiResponseType<{ events: any[]; total: number }>> {
    try {
      const { chainName, walletAddress, startDate, endDate, eventType, limit, offset } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const result = await this.stockManagerEventRepository.getWalletEvents(
        chainName,
        walletAddress,
        startDateObj,
        endDateObj,
        eventType,
        limit,
        offset
      );

      return {
        success: true,
        data: result,
        message: 'Wallet events retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: { events: [], total: 0 },
        message: error.message || 'Failed to retrieve wallet events'
      };
    }
  }

  @Get('wallet-summary')
  @ApiOperation({
    summary: 'Get wallet summary for a specific wallet address',
    description: 'Retrieves comprehensive summary statistics for a given wallet address.'
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet summary retrieved successfully'
  })
  async getWalletSummary(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletSummaryDto
  ): Promise<ApiResponseType<WalletEventSummary>> {
    try {
      const { chainName, walletAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const summary = await this.stockManagerEventRepository.getWalletSummary(
        chainName,
        walletAddress,
        startDateObj,
        endDateObj
      );

      return {
        success: true,
        data: summary,
        message: 'Wallet summary retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalMinted: '0',
          totalRedeemed: '0',
          totalEvents: 0,
          totalFees: '0',
          uniqueTokens: 0,
          uniqueStablecoins: 0,
          assets: []
        },
        message: error.message || 'Failed to retrieve wallet summary'
      };
    }
  }

  @Get('wallet-daily-activity')
  @ApiOperation({
    summary: 'Get daily activity for a specific wallet address',
    description: 'Retrieves daily aggregated activity data for a given wallet address.'
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet daily activity retrieved successfully'
  })
  async getWalletDailyActivity(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletDailyActivityDto
  ): Promise<ApiResponseType<WalletDailyActivity[]>> {
    try {
      const { chainName, walletAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const activity = await this.stockManagerEventRepository.getWalletDailyActivity(
        chainName,
        walletAddress,
        startDateObj,
        endDateObj
      );

      return {
        success: true,
        data: activity,
        message: 'Wallet daily activity retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to retrieve wallet daily activity'
      };
    }
  }

  @Get('total-fees-collected')
  @ApiOperation({
    summary: 'Get total fees collected',
    description: 'Retrieves total fees collected across all events with optional filtering by asset token.'
  })
  @ApiResponse({
    status: 200,
    description: 'Total fees collected retrieved successfully'
  })
  async getTotalFeesCollected(
    @Query(new ValidationPipe({ transform: true })) query: GetTotalFeesCollectedDto
  ): Promise<ApiResponseType<TotalFeesCollected>> {
    try {
      const { chainName, assetTokenAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const fees = await this.stockManagerEventRepository.getTotalFeesCollected(
        chainName,
        startDateObj,
        endDateObj,
        assetTokenAddress
      );

      return {
        success: true,
        data: fees,
        message: 'Total fees collected retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalFees: '0',
          totalEvents: 0,
          dailyFees: []
        },
        message: error.message || 'Failed to retrieve total fees collected'
      };
    }
  }

  @Get('aggregated-analytics')
  @ApiOperation({
    summary: 'Get aggregated analytics',
    description: 'Retrieves comprehensive aggregated analytics across all events.'
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated analytics retrieved successfully'
  })
  async getAggregatedAnalytics(
    @Query(new ValidationPipe({ transform: true })) query: GetAggregatedAnalyticsDto
  ): Promise<ApiResponseType<AggregatedAnalytics>> {
    try {
      const { chainName, assetTokenAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const analytics = await this.stockManagerEventRepository.getAggregatedAnalytics(
        chainName,
        startDateObj,
        endDateObj,
        assetTokenAddress
      );

      return {
        success: true,
        data: analytics,
        message: 'Aggregated analytics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalTokensMinted: '0',
          totalTokensRedeemed: '0',
          totalEvents: 0,
          totalFees: '0',
          uniqueWallets: 0,
          uniqueTokens: 0,
          uniqueWalletsList: [],
          uniqueTokensList: []
        },
        message: error.message || 'Failed to retrieve aggregated analytics'
      };
    }
  }

  @Get('token-activity-summary')
  @ApiOperation({
    summary: 'Get token activity summary for a specific asset token and stablecoin pair',
    description: 'Retrieves summary statistics for a specific asset token address and stablecoin address pair including total minted, redeemed, fees, unique wallets count, and list of unique wallet addresses.'
  })
  @ApiResponse({
    status: 200,
    description: 'Token activity summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalMinted: { type: 'string', example: '1000000000000000000000' },
            totalRedeemed: { type: 'string', example: '500000000000000000000' },
            totalEvents: { type: 'number', example: 150 },
            totalFees: { type: 'string', example: '5000000000000000000' },
            uniqueWallets: { type: 'number', example: 25 },
            uniqueWalletAddresses: {
              type: 'array',
              items: { type: 'string' },
              example: ['0x7c897A2E4021E2dE197395Fa6731eDE219354c62', '0x8d9a2E4021E2dE197395Fa6731eDE219354c63']
            }
          }
        },
        message: { type: 'string', example: 'Token activity summary retrieved successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getTokenActivitySummary(
    @Query(new ValidationPipe({ transform: true })) query: GetTokenActivitySummaryDto
  ): Promise<ApiResponseType<TokenActivitySummary>> {
    try {
      const { chainName, assetTokenAddress, stablecoinAddress, startDate, endDate } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const summary = await this.stockManagerEventRepository.getTokenActivitySummary(
        chainName,
        assetTokenAddress,
        stablecoinAddress,
        startDateObj,
        endDateObj
      );

      return {
        success: true,
        data: summary,
        message: 'Token activity summary retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalMinted: '0',
          totalRedeemed: '0',
          totalEvents: 0,
          totalFees: '0',
          uniqueWallets: 0,
          uniqueWalletAddresses: []
        },
        message: error.message || 'Failed to retrieve token activity summary'
      };
    }
  }

  @Get('top-users')
  @ApiOperation({
    summary: 'Get top depositors or redeemers for a specific token',
    description: 'Retrieves the top users by total deposited or redeemed amounts for a specific asset token address.'
  })
  @ApiResponse({
    status: 200,
    description: 'Top users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
              totalAmount: { type: 'string', example: '1000000000000000000000' },
              totalEvents: { type: 'number', example: 15 },
              totalFees: { type: 'string', example: '5000000000000000000' }
            }
          }
        },
        message: { type: 'string', example: 'Top users retrieved successfully' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error'
  })
  async getTopUsers(
    @Query(new ValidationPipe({ transform: true })) query: GetTopUsersDto
  ): Promise<ApiResponseType<TopUser[]>> {
    try {
      const { chainName, assetTokenAddress, type, startDate, endDate, limit } = query;

      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;

      const topUsers = await this.stockManagerEventRepository.getTopUsers(
        chainName,
        assetTokenAddress,
        type as 'depositors' | 'redeemers',
        startDateObj,
        endDateObj,
        limit
      );

      return {
        success: true,
        data: topUsers,
        message: 'Top users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to retrieve top users'
      };
    }
  }
}
