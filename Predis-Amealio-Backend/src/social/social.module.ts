import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { SocialAccount } from '../common/entities/social-account.entity';
import { Content } from '../common/entities/content.entity';
import { FacebookStrategy } from './facebook.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([SocialAccount, Content])],
  controllers: [SocialController],
  providers: [SocialService, FacebookStrategy],
  exports: [SocialService],
})
export class SocialModule {}
