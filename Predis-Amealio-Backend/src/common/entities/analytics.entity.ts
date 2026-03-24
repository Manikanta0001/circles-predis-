import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Content } from './content.entity';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_id' })
  contentId: string;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  shares: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ name: 'engagement_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagementRate: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;

  @ManyToOne(() => Content, (content) => content.analytics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
