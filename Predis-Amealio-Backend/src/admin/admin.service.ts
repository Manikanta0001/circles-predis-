import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Content } from '../common/entities/content.entity';
import { AdminSettings } from '../common/entities/admin-settings.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(AdminSettings)
    private settingsRepository: Repository<AdminSettings>,
  ) {}

  async getStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalContent, activeUsers] = await Promise.all([
      this.userRepository.count(),
      this.contentRepository.count(),
      this.userRepository.count({
        where: {
          updatedAt: MoreThanOrEqual(thirtyDaysAgo),
        },
      }),
    ]);

    // Get users by role
    const usersByRoleData = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const usersByRole = Object.fromEntries(
      usersByRoleData.map(r => [r.role, parseInt(r.count)])
    );

    // Get content by status
    const contentByStatusData = await this.contentRepository
      .createQueryBuilder('content')
      .select('content.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('content.status')
      .getRawMany();

    const contentByStatus = Object.fromEntries(
      contentByStatusData.map(c => [c.status, parseInt(c.count)])
    );

    return {
      totalUsers,
      totalContent,
      activeUsers,
      usersByRole,
      contentByStatus,
      revenueThisMonth: 45000,
    };
  }

  async getUsers(limit = 100) {
    return this.userRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });
  }

  async updateUserTier(userId: string, tier: string) {
    await this.userRepository.update({ id: userId }, { subscriptionTier: tier });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getSettings() {
    return this.settingsRepository.find();
  }

  async updateSetting(key: string, value: string) {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
      return this.settingsRepository.save(setting);
    } else {
      const newSetting = this.settingsRepository.create({ key, value });
      return this.settingsRepository.save(newSetting);
    }
  }
}
