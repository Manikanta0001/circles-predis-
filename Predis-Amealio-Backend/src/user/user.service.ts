import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Content } from '../common/entities/content.entity';
import { Brand } from '../common/entities/brand.entity';
import { SocialAccount } from '../common/entities/social-account.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['brands', 'socialAccounts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async updateCredits(userId: string, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    user.credits += amount;
    return this.userRepository.save(user);
  }

  async updateSubscription(userId: string, tier: string): Promise<User> {
    await this.userRepository.update(userId, { subscriptionTier: tier });
    return this.findOne(userId);
  }

  async getDashboardStats(userId: string) {
    try {
      const user = await this.findOne(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Initialize default values
      let totalContent = 0;
      let scheduledPosts = 0;
      let publishedPosts = 0;
      let brands = 0;
      let socialAccounts = 0;
      let recentContent = [];
      
      try {
        // Get counts safely
        [totalContent, scheduledPosts, publishedPosts, brands, socialAccounts] = await Promise.all([
          this.contentRepository.count({ where: { userId } }).catch(() => 0),
          this.contentRepository.count({ where: { userId, status: 'scheduled' } }).catch(() => 0),
          this.contentRepository.count({ where: { userId, status: 'published' } }).catch(() => 0),
          this.brandRepository.count({ where: { userId } }).catch(() => 0),
          this.socialAccountRepository.count({ where: { userId } }).catch(() => 0),
        ]);

        // Get recent content safely
        recentContent = await this.contentRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
          take: 5,
          relations: ['brand'],
        }).catch(() => []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Continue with default values
      }

      return {
        success: true,
        totalContent,
        scheduledPosts,
        publishedPosts,
        brands,
        socialAccounts,
        credits: user.credits || 0,
        subscriptionTier: user.subscriptionTier || 'free',
        recentContent: recentContent || [],
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      // Return a valid response even if there's an error
      return {
        success: false,
        message: error.message || 'Failed to load dashboard data',
        totalContent: 0,
        scheduledPosts: 0,
        publishedPosts: 0,
        brands: 0,
        socialAccounts: 0,
        credits: 0,
        subscriptionTier: 'free',
        recentContent: [],
      };
    }
  }
}
