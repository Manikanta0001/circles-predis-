import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  @Column({ name: 'payment_id', unique: true, nullable: true })
  paymentId: string;

  @Column()
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 'razorpay' })
  provider: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt: Date;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
