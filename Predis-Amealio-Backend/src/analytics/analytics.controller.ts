import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    return this.analyticsService.getOverview(req.user.userId);
  }

  @Get('platform')
  async getPlatformBreakdown(@Request() req) {
    return this.analyticsService.getPlatformBreakdown(req.user.userId);
  }
}
