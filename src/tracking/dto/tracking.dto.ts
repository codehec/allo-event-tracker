import { IsString, IsOptional, IsDateString, IsNumber, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetDailyTokenAmountsDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    default: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564'
  })
  @IsString()
  assetTokenAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetTokenSummaryDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    default: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564'
  })
  @IsString()
  assetTokenAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetWalletEventsDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62',
    default: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62'
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Event type filter',
    enum: ['deposited', 'redeemed'],
    required: false
  })
  @IsOptional()
  @IsIn(['deposited', 'redeemed'])
  eventType?: string;

  @ApiProperty({
    description: 'Number of events to return',
    example: 50,
    default: 50,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'limit must be a valid number' })
  limit?: number;

  @ApiProperty({
    description: 'Number of events to skip',
    example: 0,
    default: 0,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'offset must be a valid number' })
  offset?: number;
}

export class GetWalletSummaryDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62',
    default: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62'
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetWalletDailyActivityDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62',
    default: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62'
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetTotalFeesCollectedDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address (optional)',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    required: false
  })
  @IsOptional()
  @IsString()
  assetTokenAddress?: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetAggregatedAnalyticsDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address (optional)',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    required: false
  })
  @IsOptional()
  @IsString()
  assetTokenAddress?: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetUserTransactionHistoryDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62',
    default: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62'
  })
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Number of transactions to return',
    example: 20,
    default: 20,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of transactions to skip',
    example: 0,
    default: 0,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;
}

export class GetTokenActivitySummaryDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    default: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564'
  })
  @IsString()
  assetTokenAddress: string;

  @ApiProperty({
    description: 'Stablecoin address',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62'
  })
  @IsString()
  stablecoinAddress: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class GetTopUsersDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    default: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564'
  })
  @IsString()
  assetTokenAddress: string;

  @ApiProperty({
    description: 'Type of top users to get',
    enum: ['depositors', 'redeemers'],
    example: 'depositors'
  })
  @IsIn(['depositors', 'redeemers'])
  type: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Number of top users to return',
    example: 10,
    default: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}

export class GetFilteredEventsDto {
  @ApiProperty({
    description: 'Chain name',
    example: 'bsc',
    default: 'bsc'
  })
  @IsString()
  chainName: string;

  @ApiProperty({
    description: 'Asset token address (optional)',
    example: '0x7c3BB5892D9D12e93aBcB8C34f2197DC56707564',
    required: false
  })
  @IsOptional()
  @IsString()
  assetTokenAddress?: string;

  @ApiProperty({
    description: 'Wallet address (optional)',
    example: '0x7c897A2E4021E2dE197395Fa6731eDE219354c62',
    required: false
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({
    description: 'Event type filter (optional)',
    enum: ['deposited', 'redeemed'],
    required: false
  })
  @IsOptional()
  @IsIn(['deposited', 'redeemed'])
  eventType?: string;

  @ApiProperty({
    description: 'Start date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date (optional)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Start block number (optional)',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'startBlock must be a valid number' })
  @Min(0, { message: 'startBlock must not be less than 0' })
  startBlock?: number;

  @ApiProperty({
    description: 'End block number (optional)',
    example: 30010000,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = parseInt(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsNumber({}, { message: 'endBlock must be a valid number' })
  @Min(0, { message: 'endBlock must not be less than 0' })
  endBlock?: number;

  @ApiProperty({
    description: 'Number of events to return',
    example: 20,
    default: 20,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of events to skip',
    example: 0,
    default: 0,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;
}
