import { Controller, Post, Body, Query, Logger, BadRequestException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Web3Service } from './web3.service';
import { blockchainConfigs } from '../config/blockchain.config';
import { StorePreviousEventsDto } from './dto/web3.dto';

@ApiTags('web3')
@Controller('web3')
export class Web3Controller {
  private readonly logger = new Logger(Web3Controller.name);

  constructor(private readonly web3Service: Web3Service) {}

  @Post('store-previous-events')
  @ApiOperation({ summary: 'Store previous blockchain events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Previous events stored successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Previous events stored successfully' },
        chainId: { type: 'number', example: 56 },
        fromBlock: { type: 'number', example: 30000000 },
        contracts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string', example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564' },
              name: { type: 'string', example: 'AlloVault' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({
    name: 'fromBlock',
    required: false,
    description: 'Starting block number (overrides body parameter)',
    example: '30000000'
  })
  async storePreviousEvents(
    @Body() body: StorePreviousEventsDto,
    @Query('fromBlock') fromBlock?: string
  ) {
    try {
      this.logger.log('Received request to store previous events');
      
      const { chainId } = body;
      const fromBlockNumber = fromBlock ? parseInt(fromBlock) : body.fromBlock;

      if (!chainId) {
        throw new BadRequestException('Chain ID is required');
      }

      const blockchainConfig = blockchainConfigs.find(config => config.chainId === chainId);
      
      if (!blockchainConfig) {
        throw new BadRequestException(`Blockchain configuration not found`);
      }

      if (!blockchainConfig.wssUrl || blockchainConfig.wssUrl.trim() === '') {
        throw new BadRequestException(`WebSocket URL is not configured`);
      }

      await this.web3Service.storePreviousEvents([blockchainConfig], fromBlockNumber);

      return {
        success: true,
        message: 'Previous events stored successfully',
        chainId,
        fromBlock: fromBlockNumber,
        contracts: blockchainConfig.contracts.map(c => ({ address: c.address, name: c.name }))
      };
    } catch (error) {
      this.logger.error('Error storing previous events:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: 'Failed to store previous events',
        error: error.message
      };
    }
  }

  @Post('trigger-backfill')
  @ApiOperation({ summary: 'Manually trigger backfill for missed events' })
  @ApiResponse({ 
    status: 200, 
    description: 'Backfill triggered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Backfill triggered successfully' },
        blockCount: { type: 'number', example: 10000 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({
    name: 'blockCount',
    required: false,
    description: 'Number of blocks to backfill (default: 10000)',
    example: '10000'
  })
  async triggerBackfill(@Query('blockCount') blockCount?: string) {
    try {
      this.logger.log('Received request to trigger backfill');
      
      const blockCountNumber = blockCount ? parseInt(blockCount) : 10000;
      
      if (blockCountNumber <= 0 || blockCountNumber > 50000) {
        throw new BadRequestException('Block count must be between 1 and 50000');
      }

      await this.web3Service.triggerManualBackfill(blockCountNumber);

      return {
        success: true,
        message: 'Backfill triggered successfully',
        blockCount: blockCountNumber
      };
    } catch (error) {
      this.logger.error('Error triggering backfill:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      return {
        success: false,
        message: 'Failed to trigger backfill',
        error: error.message
      };
    }
  }

  @Get('backfill-status')
  @ApiOperation({ summary: 'Get backfill process status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Backfill status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        status: {
          type: 'object',
          properties: {
            isRunning: { type: 'boolean', example: true },
            lastRun: { type: 'string', format: 'date-time', nullable: true },
            nextRun: { type: 'string', format: 'date-time', nullable: true }
          }
        }
      }
    }
  })
  async getBackfillStatus() {
    try {
      const status = this.web3Service.getBackfillStatus();
      
      return {
        success: true,
        status
      };
    } catch (error) {
      this.logger.error('Error getting backfill status:', error);
      
      return {
        success: false,
        message: 'Failed to get backfill status',
        error: error.message
      };
    }
  }
}
