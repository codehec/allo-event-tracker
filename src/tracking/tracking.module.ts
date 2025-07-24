import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { EventRepository } from '../repositories/event.repository';
import { Event } from '../entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [TrackingController],
  providers: [EventRepository],
  exports: [EventRepository]
})
export class TrackingModule {} 