import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { SaveContentDto } from './dto/save-content.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('merchant')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Post('generate')
  async generate(@Request() req, @Body() dto: GenerateContentDto) {
    return this.contentService.generateContent(req.user.userId, dto);
  }

  @Post('prompt-suggestions')
  async promptSuggestions(@Request() req, @Body() dto: GenerateContentDto) {
    return this.contentService.generatePromptSuggestions(req.user.userId, dto);
  }

  @Post('save')
  async save(@Request() req, @Body() dto: SaveContentDto) {
    return this.contentService.saveContent(req.user.userId, dto);
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    try {
      return await this.contentService.getDashboardStats(req.user.userId);
    } catch (error: any) {
      console.error('getDashboard error:', {
        userId: req.user?.userId,
        message: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }

  @Get('content/list')
  async getContent(
    @Request() req,
    @Query('filter') filter?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.contentService.getContent(req.user.userId, filter, pageNum, limitNum);
  }

  @Get('content/:id')
  async getContentById(@Request() req, @Param('id') id: string) {
    return this.contentService.getContentById(req.user.userId, id);
  }

  @Delete('content/:id')
  async deleteContent(@Request() req, @Param('id') id: string) {
    return this.contentService.deleteContent(req.user.userId, id);
  }

  @Post('content/:id/schedule')
  async scheduleContent(
    @Request() req,
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
  ) {
    const scheduledDate = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(scheduledDate.getTime())) {
      throw new BadRequestException('scheduledAt must be a valid ISO date string');
    }

    return this.contentService.scheduleContent(
      req.user.userId,
      id,
      scheduledDate,
    );
  }
}
