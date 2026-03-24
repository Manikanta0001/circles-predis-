import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('social_accounts')
export class SocialAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  platform: string;

  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @Column({ name: 'access_token', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'expires_at', nullable: true, type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
