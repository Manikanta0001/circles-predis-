import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { Content } from '../common/entities/content.entity';
import { Brand } from '../common/entities/brand.entity';
import { User } from '../common/entities/user.entity';
import { Analytics } from '../common/entities/analytics.entity';
import { RedisService } from '../common/redis.service';
import { AIModule } from '../integrations/ai/ai.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, Brand, User, Analytics]),
    AIModule,
    AnalyticsModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, RedisService],
  exports: [ContentService],
})
export class ContentModule {}
