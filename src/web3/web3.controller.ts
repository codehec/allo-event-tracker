import { Controller, Post, Body, Query, Logger, BadRequestException } from '@nestjs/common';
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
}
