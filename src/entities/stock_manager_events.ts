import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_manager_events')
export class StockManagerEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  event_type: string;

  @Column()
  wallet_address: string;

  @Column()
  asset_token_address: string;

  @Column()
  stablecoin_address: string;

  @Column()
  amount_deposited: string;

  @Column()
  tokens_minted: string;

  @Column()
  tokens_redeemed: string;

  @Column()
  amount_returned: string;

  @Column()
  fee: string;

  @Column()
  network: string;

  @Column()
  block_number: number;

  @Column()
  transaction_hash: string;

  @Column()
  timestamp: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  created_at: Date;
} 