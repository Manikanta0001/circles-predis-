import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../common/entities/user.entity';
import { Content } from '../common/entities/content.entity';
import { AdminSettings } from '../common/entities/admin-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Content, AdminSettings])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
