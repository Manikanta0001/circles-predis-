import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Brand } from './brand.entity';
import { Analytics } from './analytics.entity';

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'brand_id', nullable: true })
  brandId: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  prompt: string;

  @Column({ name: 'generated_text', nullable: true, type: 'text' })
  generatedText: string;

  @Column({ name: 'generated_image', nullable: true })
  generatedImage: string;

  @Column({ name: 'generated_video', nullable: true })
  generatedVideo: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ nullable: true })
  platform: string;

  @Column({ name: 'scheduled_at', nullable: true, type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'published_at', nullable: true, type: 'timestamp' })
  publishedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Brand, (brand) => brand.content, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => Analytics, (analytics) => analytics.content)
  analytics: Analytics[];
}
