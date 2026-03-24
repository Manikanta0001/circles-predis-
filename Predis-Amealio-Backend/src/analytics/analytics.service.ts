import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../common/entities/analytics.entity';
import { Content } from '../common/entities/content.entity';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private redis: RedisService,
  ) {}

  async getOverview(userId: string) {
    // Check cache first
    const cacheKey = `analytics:overview:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get analytics data
    const analytics = await this.analyticsRepository
      .createQueryBuilder('analytics')
      .leftJoin('analytics.content', 'content')
      .where('content.userId = :userId', { userId })
      .getMany();

    const overview = {
      totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
      totalLikes: analytics.reduce((sum, a) => sum + a.likes, 0),
      totalShares: analytics.reduce((sum, a) => sum + a.shares, 0),
      totalComments: analytics.reduce((sum, a) => sum + a.comments, 0),
      engagementRate: 8.5, // Calculate based on data
      viewsGrowth: 15.3,
      likesGrowth: 12.7,
      sharesGrowth: 8.4,
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(overview), 300);

    return overview;
  }

  async getPlatformBreakdown(userId: string) {
    const content = await this.contentRepository.find({
      where: { userId },
      relations: ['analytics'],
    });

    const platformStats: any = {};

    content.forEach(c => {
      if (!c.platform) return;
      
      if (!platformStats[c.platform]) {
        platformStats[c.platform] = {
          platform: c.platform,
          views: 0,
          likes: 0,
          shares: 0,
          engagement: 0,
        };
      }

      c.analytics.forEach(a => {
        platformStats[c.platform].views += a.views;
        platformStats[c.platform].likes += a.likes;
        platformStats[c.platform].shares += a.shares;
      });
    });

    return Object.values(platformStats);
  }
}
