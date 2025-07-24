import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class StorePreviousEventsDto {
  @ApiProperty({
    description: 'Chain ID for the blockchain',
    example: 56,
    default: 56
  })
  @IsNumber()
  chainId: number;

  @ApiProperty({
    description: 'Starting block number to fetch events from',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  fromBlock?: number;
} 