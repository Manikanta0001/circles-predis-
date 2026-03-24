import { Module } from '@nestjs/common';
import { SocialController } from './_social.controller';
import { SocialService } from './_social.service';
import { FacebookStrategy } from './facebook.strategy';

@Module({
  controllers: [SocialController],
  providers: [SocialService, FacebookStrategy],
  exports: [SocialService],
})
export class SocialModule {}
