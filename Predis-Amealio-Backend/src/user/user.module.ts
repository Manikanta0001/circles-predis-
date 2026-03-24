import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../common/entities/user.entity';
import { Content } from '../common/entities/content.entity';
import { Brand } from '../common/entities/brand.entity';
import { SocialAccount } from '../common/entities/social-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Content, Brand, SocialAccount])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
