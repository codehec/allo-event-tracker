import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Module } from './web3/web3.module';
import { TrackingModule } from './tracking/tracking.module';
import { ConfigModule } from '@nestjs/config';
import { Event } from './entities/event.entity';
import { EventRepository } from './repositories/event.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.SUPABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Event]),
    Web3Module,
    TrackingModule
  ],
  controllers: [AppController],
  providers: [AppService, EventRepository],
  exports: [EventRepository],
})
export class AppModule {}
