import { Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockManagerEvent } from 'src/entities/stock_manager_events';
import { StockManagerEventRepository } from 'src/repositories/stock_manager_events.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StockManagerEvent])],
  controllers: [Web3Controller],
  providers: [Web3Service, StockManagerEventRepository],
})
export class Web3Module {}
