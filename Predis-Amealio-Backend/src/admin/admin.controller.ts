import { Controller, Get, Put, Param, Body, UseGuards, Post, Query, Request, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private analyticsService: AnalyticsService,
  ) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Put('users/:id/tier')
  async updateUserTier(
    @Param('id') userId: string,
    @Body('tier') tier: string,
  ) {
    return this.adminService.updateUserTier(userId, tier);
  }

  /**
   * DEV-ONLY: seed demo analytics so merchant charts render locally.
   * Example: POST /api/admin/dev/seed-analytics?days=30
   */
  @Post('dev/seed-analytics')
  async seedDemoAnalytics(@Request() req, @Query('days') days?: string) {
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }

    const parsedDays = days ? parseInt(days, 10) : 30;
    // Seed for the *requesting user* (admin) by default.
    return this.analyticsService.seedDemoAnalyticsForUser(req.user.userId, parsedDays);
  }
}
