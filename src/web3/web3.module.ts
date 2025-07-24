import { Module } from '@nestjs/common';
import { Web3Controller } from './web3.controller';
import { Web3Service } from './web3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { EventRepository } from 'src/repositories/event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [Web3Controller],
  providers: [Web3Service, EventRepository],
})
export class Web3Module {}
