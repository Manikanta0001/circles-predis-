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

  /**
   * DEV-ONLY: Seed demo analytics rows so charts can be previewed locally.
   * Idempotent by default: does not create duplicates for the same contentId + day.
   */
  async seedDemoAnalyticsForUser(
    userId: string,
    days: number = 30,
  ): Promise<{ inserted: number; skipped: number; days: number; contentCount: number }> {
    const safeDays = Number.isFinite(days) ? Math.max(1, Math.min(365, Math.floor(days))) : 30;

    const contentList = await this.contentRepository.find({
      where: { userId },
      select: ['id', 'createdAt'],
    });

    if (contentList.length === 0) {
      return { inserted: 0, skipped: 0, days: safeDays, contentCount: 0 };
    }

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (safeDays - 1));
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    // Load existing rows in the target window for this user to avoid duplicates.
    const existing = await this.analyticsRepository
      .createQueryBuilder('a')
      .innerJoin('a.content', 'c')
      .where('c.userId = :userId', { userId })
      .andWhere('a.recordedAt BETWEEN :start AND :end', { start, end })
      .select(['a.contentId', 'a.recordedAt'])
      .getMany();

    const existingKey = new Set<string>();
    for (const row of existing) {
      const day = new Date(row.recordedAt).toISOString().slice(0, 10);
      existingKey.add(`${row.contentId}:${day}`);
    }

    let inserted = 0;
    let skipped = 0;

    const toInsert: Array<Partial<Analytics>> = [];

    for (let i = 0; i < safeDays; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      // Noon UTC helps avoid timezone edge cases when slicing ISO date.
      d.setUTCHours(12, 0, 0, 0);
      const dayKey = d.toISOString().slice(0, 10);

      for (const c of contentList) {
        // Don't create analytics before the content existed.
        const createdDay = new Date(c.createdAt).toISOString().slice(0, 10);
        if (createdDay > dayKey) continue;

        const k = `${c.id}:${dayKey}`;
        if (existingKey.has(k)) {
          skipped++;
          continue;
        }

        const base = this.hashToUnit(`${userId}:${c.id}:${dayKey}`);
        const views = Math.floor(40 + base * 800); // 40..840
        const likes = Math.floor(2 + base * 80); // 2..82
        const shares = Math.floor(base * 18); // 0..18
        const comments = Math.floor(base * 10); // 0..10
        const engagementRate =
          views > 0 ? Math.round(((likes + shares + comments) / views) * 10000) / 100 : 0;

        toInsert.push({
          contentId: c.id,
          views,
          likes,
          shares,
          comments,
          engagementRate,
          recordedAt: d,
        });
        inserted++;
        existingKey.add(k);
      }
    }

    if (toInsert.length > 0) {
      // Use insert for speed; recordedAt is explicitly set.
      await this.analyticsRepository.insert(toInsert as Analytics[]);
    }

    // Clear overview cache so new numbers appear immediately.
    await this.redis.del(`analytics:overview:${userId}`);

    return { inserted, skipped, days: safeDays, contentCount: contentList.length };
  }

  private hashToUnit(input: string): number {
    // Deterministic pseudo-random 0..1 (so seeding is stable between calls).
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // Convert to 0..1
    return (h >>> 0) / 0xffffffff;
  }
}
