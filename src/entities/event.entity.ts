import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chain_name: string;

  @Column()
  event_type: string;

  @Column()
  contract_address: string;

  @Column()
  tx_hash: string;

  @Column()
  block_number: number;

  @Column()
  user: string;

  @Column()
  asset_token: string;

  @Column()
  stablecoin: string;

  @Column()
  amount: string;

  @Column()
  token_amount: string;

  @Column()
  fee: string;

  @Column({ type: 'jsonb' })
  event_data: Record<string, any>;

  @Column()
  timestamp: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  created_at: Date;
} 