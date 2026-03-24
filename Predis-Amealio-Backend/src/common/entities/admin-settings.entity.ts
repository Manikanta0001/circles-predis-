import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin_settings')
export class AdminSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
