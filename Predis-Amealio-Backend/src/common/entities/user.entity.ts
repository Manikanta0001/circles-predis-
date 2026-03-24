import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Content } from './content.entity';
import { SocialAccount } from './social-account.entity';
import { Transaction } from './transaction.entity';
import { Payment } from './payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ default: 'merchant' })
  role: string;

  @Column({ name: 'subscription_tier', default: 'free' })
  subscriptionTier: string;

  @Column({ name: 'google_id', unique: true, nullable: true })
  googleId: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ default: 100 })
  credits: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Brand, (brand) => brand.user)
  brands: Brand[];

  @OneToMany(() => Content, (content) => content.user)
  content: Content[];

  @OneToMany(() => SocialAccount, (account) => account.user)
  socialAccounts: SocialAccount[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
