import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SocialAccount } from '../common/entities/social-account.entity';
import { Content } from '../common/entities/content.entity';
import { ConnectSocialDto } from './dto/connect-social.dto';
import { PublishContentDto } from './dto/publish-content.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import axios from 'axios';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    private configService: ConfigService,
  ) {}

  async getUserAccounts(userId: string) {
    return this.socialAccountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async connectAccount(userId: string, dto: ConnectSocialDto) {
    // Check if account already exists
    const existing = await this.socialAccountRepository.findOne({
      where: { 
        userId, 
        platform: dto.platform,
        accountName: dto.accountName 
      },
    });

    if (existing) {
      throw new BadRequestException('This account is already connected');
    }

    const account = this.socialAccountRepository.create({
      userId,
      platform: dto.platform,
      accountName: dto.accountName,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresAt: dto.expiresAt,
      isActive: true,
    });

    return this.socialAccountRepository.save(account);
  }

  async disconnectAccount(userId: string, accountId: string) {
    const account = await this.socialAccountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    await this.socialAccountRepository.remove(account);

    return { success: true, message: 'Account disconnected successfully' };
  }

  async publishContent(userId: string, dto: PublishContentDto) {
    const account = await this.socialAccountRepository.findOne({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    const content = await this.contentRepository.findOne({
      where: { id: dto.contentId, userId },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // In a real implementation, this would call the actual social media APIs
    // For now, we'll simulate publishing
    await this.contentRepository.update(
      { id: content.id },
      {
        status: 'published',
        publishedAt: new Date(),
        platform: account.platform,
      }
    );

    return {
      success: true,
      message: `Content published to ${account.platform} successfully`,
      contentId: content.id,
      platform: account.platform,
    };
  }

  getSupportedPlatforms() {
    return [
      {
        id: 'instagram',
        name: 'Instagram',
        icon: 'instagram',
        description: 'Share photos and stories',
        requiresAuth: true,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: 'facebook',
        description: 'Post to your page or profile',
        requiresAuth: true,
      },
      {
        id: 'twitter',
        name: 'Twitter (X)',
        icon: 'twitter',
        description: 'Share tweets and threads',
        requiresAuth: true,
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: 'linkedin',
        description: 'Professional network posts',
        requiresAuth: true,
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: 'tiktok',
        description: 'Short-form video content',
        requiresAuth: true,
      },
    ];
  }

  async handleFacebookCallback(query) {
    const longLived = query.long_lived_token;
    if (!longLived) return { message: 'No token received' };

    const pages = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
      params: {
        fields: 'id,name,access_token,instagram_business_account',
        access_token: longLived,
      },
    });

    return {
      longLivedToken: longLived,
      pages: pages.data.data,
    };
  }

  async handleOAuthCallback(userId: string, dto: OAuthCallbackDto) {
    try {
      // Exchange authorization code for access token
      let tokenData: any;
      let accountName: string;

      switch (dto.platform) {
        case 'instagram':
          tokenData = await this.exchangeInstagramCode(dto.code, dto.redirectUri);
          accountName = tokenData.username || 'Instagram User';
          break;

        case 'facebook':
          tokenData = await this.exchangeFacebookCode(dto.code, dto.redirectUri);
          accountName = tokenData.name || 'Facebook User';
          break;

        case 'linkedin':
          tokenData = await this.exchangeLinkedInCode(dto.code, dto.redirectUri);
          accountName = tokenData.name || 'LinkedIn User';
          break;

        case 'google':
          tokenData = await this.exchangeGoogleCode(dto.code, dto.redirectUri);
          accountName = tokenData.email || 'Google User';
          break;

        default:
          throw new BadRequestException(`Unsupported platform: ${dto.platform}`);
      }

      // Save or update the account
      const existing = await this.socialAccountRepository.findOne({
        where: { userId, platform: dto.platform },
      });

      if (existing) {
        existing.accessToken = tokenData.access_token;
        existing.refreshToken = tokenData.refresh_token;
        existing.expiresAt = tokenData.expires_at;
        existing.accountName = accountName;
        existing.isActive = true;
        return this.socialAccountRepository.save(existing);
      } else {
        const account = this.socialAccountRepository.create({
          userId,
          platform: dto.platform,
          accountName,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: tokenData.expires_at,
          isActive: true,
        });
        return this.socialAccountRepository.save(account);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new BadRequestException(`Failed to connect ${dto.platform}: ${error.message}`);
    }
  }

  private async exchangeInstagramCode(code: string, redirectUri: string) {
    const clientId = this.configService.get('INSTAGRAM_CLIENT_ID');
    const clientSecret = this.configService.get('INSTAGRAM_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      // Return mock data for development
      return {
        access_token: 'mock_instagram_token_' + Date.now(),
        refresh_token: 'mock_refresh_token',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        username: 'demo_instagram_user',
      };
    }

    const response = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: new Date(Date.now() + response.data.expires_in * 1000),
      username: response.data.user.username,
    };
  }

  private async exchangeFacebookCode(code: string, redirectUri: string) {
    const clientId = this.configService.get('FACEBOOK_APP_ID');
    const clientSecret = this.configService.get('FACEBOOK_APP_SECRET');

    if (!clientId || !clientSecret) {
      return {
        access_token: 'mock_facebook_token_' + Date.now(),
        refresh_token: null,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        name: 'demo_facebook_user',
      };
    }

    const response = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
    });

    return {
      access_token: response.data.access_token,
      refresh_token: null,
      expires_at: new Date(Date.now() + response.data.expires_in * 1000),
      name: 'Facebook User',
    };
  }

  private async exchangeLinkedInCode(code: string, redirectUri: string) {
    const clientId = this.configService.get('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get('LINKEDIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return {
        access_token: 'mock_linkedin_token_' + Date.now(),
        refresh_token: 'mock_refresh_token',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        name: 'demo_linkedin_user',
      };
    }

    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: new Date(Date.now() + response.data.expires_in * 1000),
      name: 'LinkedIn User',
    };
  }

  private async exchangeGoogleCode(code: string, redirectUri: string) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return {
        access_token: 'mock_google_token_' + Date.now(),
        refresh_token: 'mock_refresh_token',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        email: 'demo@google.com',
      };
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: new Date(Date.now() + response.data.expires_in * 1000),
      email: 'Google User',
    };
  }
}
