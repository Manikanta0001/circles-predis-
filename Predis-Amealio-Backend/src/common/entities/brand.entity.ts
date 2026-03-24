import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Content } from './content.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'primary_color', nullable: true })
  primaryColor: string;

  @Column({ name: 'secondary_color', nullable: true })
  secondaryColor: string;

  @Column({ name: 'font_family', nullable: true })
  fontFamily: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.brands, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Content, (content) => content.brand)
  content: Content[];
}
