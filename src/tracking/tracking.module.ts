import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { StockManagerEventRepository } from '../repositories/stock_manager_events.repository';
import { StockManagerEvent } from '../entities/stock_manager_events';

@Module({
  imports: [TypeOrmModule.forFeature([StockManagerEvent])],
  controllers: [TrackingController],
  providers: [StockManagerEventRepository],
  exports: [StockManagerEventRepository]
})
export class TrackingModule {} 