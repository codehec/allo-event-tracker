import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Web3Module } from './web3/web3.module';
import { TrackingModule } from './tracking/tracking.module';
import { ConfigModule } from '@nestjs/config';
import { StockManagerEvent } from './entities/stock_manager_events';
import { StockManagerEventRepository } from './repositories/stock_manager_events.repository';

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
    TypeOrmModule.forFeature([StockManagerEvent]),
    Web3Module,
    TrackingModule
  ],
  controllers: [AppController],
  providers: [AppService, StockManagerEventRepository],
  exports: [StockManagerEventRepository],
})
export class AppModule {}
