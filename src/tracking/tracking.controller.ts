import { Controller, Get, Query, Logger, BadRequestException, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventRepository } from '../repositories/event.repository';
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
} from './dto';
import { 
  DailyTokenAmountsResponse, 
  TokenSummaryResponse,
  WalletEventsResponse,
  WalletSummaryResponse,
  WalletDailyActivityResponse,
  TotalFeesCollectedResponse,
  AggregatedAnalyticsResponse,
  UserTransactionHistoryResponse,
  TokenActivitySummaryResponse,
  TopUsersResponse,
  FilteredEventsResponse
} from './types';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly eventRepository: EventRepository) {}

  @Get('daily-token-amounts')
  @ApiOperation({ summary: 'Get daily token amounts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Daily token amounts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            dailyAmounts: { type: 'array' },
            totalDays: { type: 'number', example: 31 }
          }
        }
      }
    }
  })
  async getDailyTokenAmounts(
    @Query(new ValidationPipe({ transform: true })) query: GetDailyTokenAmountsDto
  ): Promise<DailyTokenAmountsResponse> {
    try {
      this.logger.log(`Getting daily token amounts`);

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      }

      const dailyAmounts = await this.eventRepository.getDailyTokenAmounts(
        query.chainName,
        query.assetTokenAddress,
        startDate,
        endDate
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          dailyAmounts,
          totalDays: dailyAmounts.length
        }
      };
    } catch (error) {
      this.logger.error('Error getting daily token amounts:', error);
      return {
        success: false,
        message: 'Failed to get daily token amounts',
        error: error.message
      };
    }
  }

  @Get('token-summary')
  @ApiOperation({ summary: 'Get token summary' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            summary: { type: 'object' }
          }
        }
      }
    }
  })
  async getTokenSummary(
    @Query(new ValidationPipe({ transform: true })) query: GetTokenSummaryDto
  ): Promise<TokenSummaryResponse> {
    try {
      this.logger.log(`Getting token summary`);

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      }

      const summary = await this.eventRepository.getTokenSummary(
        query.chainName,
        query.assetTokenAddress,
        startDate,
        endDate
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          summary
        }
      };
    } catch (error) {
      this.logger.error('Error getting token summary:', error);
      return {
        success: false,
        message: 'Failed to get token summary',
        error: error.message
      };
    }
  }

  @Get('wallet-events')
  @ApiOperation({ summary: 'Get wallet events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            eventType: { type: 'string', example: 'deposited' },
            events: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number', example: 50 },
                offset: { type: 'number', example: 0 },
                total: { type: 'number', example: 100 }
              }
            }
          }
        }
      }
    }
  })
  async getWalletEvents(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletEventsDto
  ): Promise<WalletEventsResponse> {
    try {
      this.logger.log(`Getting wallet events`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const result = await this.eventRepository.getWalletEvents(
        query.chainName,
        query.walletAddress,
        startDate,
        endDate,
        query.eventType,
        query.limit || 50,
        query.offset || 0
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          walletAddress: query.walletAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          eventType: query.eventType,
          events: result.events.map(event => ({
            ...event,
            timestamp: event.timestamp,
            date: event.date.toISOString(),
            createdAt: event.createdAt.toISOString()
          })),
          pagination: {
            limit: query.limit || 50,
            offset: query.offset || 0,
            total: result.total
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting wallet events:', error);
      return {
        success: false,
        message: 'Failed to get wallet events',
        error: error.message
      };
    }
  }

  @Get('wallet-summary')
  @ApiOperation({ summary: 'Get wallet summary' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            summary: { type: 'object' }
          }
        }
      }
    }
  })
  async getWalletSummary(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletSummaryDto
  ): Promise<WalletSummaryResponse> {
    try {
      this.logger.log(`Getting wallet summary`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const summary = await this.eventRepository.getWalletSummary(
        query.chainName,
        query.walletAddress,
        startDate,
        endDate
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          walletAddress: query.walletAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          summary
        }
      };
    } catch (error) {
      this.logger.error('Error getting wallet summary:', error);
      return {
        success: false,
        message: 'Failed to get wallet summary',
        error: error.message
      };
    }
  }

  @Get('wallet-daily-activity')
  @ApiOperation({ summary: 'Get wallet daily activity' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet daily activity retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            dailyActivity: { type: 'array' },
            totalDays: { type: 'number', example: 31 }
          }
        }
      }
    }
  })
  async getWalletDailyActivity(
    @Query(new ValidationPipe({ transform: true })) query: GetWalletDailyActivityDto
  ): Promise<WalletDailyActivityResponse> {
    try {
      this.logger.log(`Getting wallet daily activity`);

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      }

      const dailyActivity = await this.eventRepository.getWalletDailyActivity(
        query.chainName,
        query.walletAddress,
        startDate,
        endDate
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          walletAddress: query.walletAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          dailyActivity,
          totalDays: dailyActivity.length
        }
      };
    } catch (error) {
      this.logger.error('Error getting wallet daily activity:', error);
      return {
        success: false,
        message: 'Failed to get wallet daily activity',
        error: error.message
      };
    }
  }

  @Get('total-fees-collected')
  @ApiOperation({ summary: 'Get total fees collected' })
  @ApiResponse({ 
    status: 200, 
    description: 'Total fees collected retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            totalFees: { type: 'string', example: '1000000000000000000000' },
            totalEvents: { type: 'number', example: 150 },
            dailyFees: { type: 'array' },
            totalDays: { type: 'number', example: 31 }
          }
        }
      }
    }
  })
  async getTotalFeesCollected(
    @Query(new ValidationPipe({ transform: true })) query: GetTotalFeesCollectedDto
  ): Promise<TotalFeesCollectedResponse> {
    try {
      this.logger.log(`Getting total fees collected`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const feeData = await this.eventRepository.getTotalFeesCollected(
        query.chainName,
        startDate,
        endDate,
        query.assetTokenAddress
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          startDate: query.startDate || 'all time',
          endDate: query.endDate || 'all time',
          assetTokenAddress: query.assetTokenAddress,
          totalFees: feeData.totalFees,
          totalEvents: feeData.totalEvents,
          dailyFees: feeData.dailyFees,
          totalDays: feeData.dailyFees.length
        }
      };
    } catch (error) {
      this.logger.error('Error getting total fees collected:', error);
      return {
        success: false,
        message: 'Failed to get total fees collected',
        error: error.message
      };
    }
  }

  @Get('aggregated-analytics')
  @ApiOperation({ summary: 'Get aggregated analytics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Aggregated analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            analytics: { type: 'object' }
          }
        }
      }
    }
  })
  async getAggregatedAnalytics(
    @Query(new ValidationPipe({ transform: true })) query: GetAggregatedAnalyticsDto
  ): Promise<AggregatedAnalyticsResponse> {
    try {
      this.logger.log(`Getting aggregated analytics`);

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (query.startDate && query.endDate) {
        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);

        if (startDate > endDate) {
          throw new BadRequestException('Start date must be before or equal to end date');
        }
      }

      const analytics = await this.eventRepository.getAggregatedAnalytics(
        query.chainName,
        startDate,
        endDate,
        query.assetTokenAddress
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          analytics
        }
      };
    } catch (error) {
      this.logger.error('Error getting aggregated analytics:', error);
      
      return {
        success: false,
        message: 'Failed to get aggregated analytics',
        error: error.message
      };
    }
  }

  @Get('user-transaction-history')
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiResponse({ 
    status: 200, 
    description: 'User transaction history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            transactions: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number', example: 20 },
                offset: { type: 'number', example: 0 },
                total: { type: 'number', example: 50 }
              }
            }
          }
        }
      }
    }
  })
  async getUserTransactionHistory(
    @Query(new ValidationPipe({ transform: true })) query: GetUserTransactionHistoryDto
  ): Promise<UserTransactionHistoryResponse> {
    try {
      this.logger.log(`Getting user transaction history`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const result = await this.eventRepository.getUserTransactionHistory(
        query.chainName,
        query.walletAddress,
        startDate,
        endDate,
        query.limit || 20,
        query.offset || 0
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          walletAddress: query.walletAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          transactions: result.transactions,
          pagination: {
            limit: query.limit || 20,
            offset: query.offset || 0,
            total: result.total
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting user transaction history:', error);
      return {
        success: false,
        message: 'Failed to get user transaction history',
        error: error.message
      };
    }
  }

  @Get('token-activity-summary')
  @ApiOperation({ summary: 'Get token activity summary' })
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
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            stablecoinAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            summary: { type: 'object' }
          }
        }
      }
    }
  })
  async getTokenActivitySummary(
    @Query(new ValidationPipe({ transform: true })) query: GetTokenActivitySummaryDto
  ): Promise<TokenActivitySummaryResponse> {
    try {
      this.logger.log(`Getting token activity summary`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const summary = await this.eventRepository.getTokenActivitySummary(
        query.chainName,
        query.assetTokenAddress,
        query.stablecoinAddress,
        startDate,
        endDate
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          stablecoinAddress: query.stablecoinAddress,
          startDate: query.startDate,
          endDate: query.endDate,
          summary
        }
      };
    } catch (error) {
      this.logger.error('Error getting token activity summary:', error);
      return {
        success: false,
        message: 'Failed to get token activity summary',
        error: error.message
      };
    }
  }

  @Get('top-users')
  @ApiOperation({ summary: 'Get top users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Top users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            type: { type: 'string', example: 'depositors' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            users: { type: 'array' },
            totalUsers: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async getTopUsers(
    @Query(new ValidationPipe({ transform: true })) query: GetTopUsersDto
  ): Promise<TopUsersResponse> {
    try {
      this.logger.log(`Getting top ${query.type}`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      const users = await this.eventRepository.getTopUsers(
        query.chainName,
        query.assetTokenAddress,
        query.type as 'depositors' | 'redeemers',
        startDate,
        endDate,
        query.limit
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          type: query.type,
          startDate: query.startDate,
          endDate: query.endDate,
          users,
          totalUsers: users.length
        }
      };
    } catch (error) {
      this.logger.error('Error getting top users:', error);
      return {
        success: false,
        message: 'Failed to get top users',
        error: error.message
      };
    }
  }

  @Get('filtered-events')
  @ApiOperation({ summary: 'Get filtered events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Filtered events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chainName: { type: 'string', example: 'bsc' },
            assetTokenAddress: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
            walletAddress: { type: 'string', example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62' },
            eventType: { type: 'string', example: 'deposited' },
            startDate: { type: 'string', example: '2024-01-01' },
            endDate: { type: 'string', example: '2024-01-31' },
            startBlock: { type: 'number', example: 30000000 },
            endBlock: { type: 'number', example: 30010000 },
            events: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number', example: 20 },
                offset: { type: 'number', example: 0 },
                total: { type: 'number', example: 100 }
              }
            }
          }
        }
      }
    }
  })
  async getFilteredEvents(
    @Query(new ValidationPipe({ transform: true })) query: GetFilteredEventsDto
  ): Promise<FilteredEventsResponse> {
    try {
      this.logger.log(`Getting filtered events`);

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date must be before or equal to end date');
      }

      if (query.startBlock && query.endBlock && query.startBlock > query.endBlock) {
        throw new BadRequestException('Start block must be before or equal to end block');
      }

      const result = await this.eventRepository.getFilteredEvents(
        query.chainName,
        query.assetTokenAddress,
        query.walletAddress,
        query.eventType,
        startDate,
        endDate,
        query.startBlock,
        query.endBlock,
        query.limit || 20,
        query.offset || 0
      );

      return {
        success: true,
        data: {
          chainName: query.chainName,
          assetTokenAddress: query.assetTokenAddress,
          walletAddress: query.walletAddress,
          eventType: query.eventType,
          startDate: query.startDate,
          endDate: query.endDate,
          startBlock: query.startBlock,
          endBlock: query.endBlock,
          events: result.events,
          pagination: {
            limit: query.limit || 20,
            offset: query.offset || 0,
            total: result.total
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting filtered events:', error);
      return {
        success: false,
        message: 'Failed to get filtered events',
        error: error.message
      };
    }
  }
} 