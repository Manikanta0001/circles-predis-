import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectSocialDto } from './dto/connect-social.dto';
import { PublishContentDto } from './dto/publish-content.dto';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';
import { AuthGuard } from '@nestjs/passport';
import { BadRequestException } from '@nestjs/common';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('accounts')
  async getAccounts(@Request() req) {
    return this.socialService.getUserAccounts(req.user.userId);
  }

  @Post('connect')
  async connectAccount(@Request() req, @Body() dto: ConnectSocialDto) {
    return this.socialService.connectAccount(req.user.userId, dto);
  }

  @Delete('accounts/:id')
  async disconnectAccount(@Request() req, @Param('id') accountId: string) {
    return this.socialService.disconnectAccount(req.user.userId, accountId);
  }

  @Post('publish')
  async publishContent(@Request() req, @Body() dto: PublishContentDto) {
    return this.socialService.publishContent(req.user.userId, dto);
  }

  // @Get('oauth/callback')
  // @UseGuards(AuthGuard('facebook'))
  // async facebookCallback(@Request() req, @Query() query: any) {
  //   // Passport Facebook strategy handles the authentication
  //   // The user info is available in req.user after successful authentication
  //   const { accessToken, profile } = req.user;
  //   
  //   try {
  //     // Store the Facebook account in database
  //     const accountData = {
  //       platform: 'facebook',
  //       accountName: profile.displayName || profile.name,
  //       accessToken: accessToken,
  //       refreshToken: null,
  //       expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
  //     };

  //     return await this.socialService.connectAccount(req.user.userId, accountData);
  //   } catch (error) {
  //     throw new BadRequestException(`Failed to connect Facebook account: ${error.message}`);
  //   }
  // }

  @Get('oauth/callback/manual')
  async manualFacebookCallback(@Request() req, @Query() query: any) {
    try {
      if (query.error) {
        throw new BadRequestException(`Facebook OAuth error: ${query.error_description || query.error}`);
      }
      
      if (!query.long_lived_token) {
        throw new BadRequestException('No long-lived token received from Facebook');
      }

      const result = await this.socialService.handleFacebookCallback(query);
      
      return {
        success: true,
        longLivedToken: result.longLivedToken,
        pages: result.pages,
        message: 'Facebook authorization successful. Please complete the connection from your app.'
      };
    } catch (error) {
      throw new BadRequestException(`Facebook callback failed: ${error.message}`);
    }
  }

  @Get('platforms')
  async getSupportedPlatforms() {
    return this.socialService.getSupportedPlatforms();
  }

  @Get('oauth')
  // @UseGuards(AuthGuard('facebook'))
  async redirectToFacebook(@Request() req) {
    // This endpoint is protected by Passport Facebook strategy
    // Passport will handle the redirect to Facebook automatically
    return { message: 'Redirecting to Facebook for authentication...' };
  }

  @Get('oauth/url')
  getFacebookAuthUrl() {
    const url = `https://www.facebook.com/v20.0/dialog/oauth
    ?client_id=${process.env.FACEBOOK_APP_ID}
    &display=page
    &extras={"setup":{"channel":"IG_API_ONBOARDING"}}
    &redirect_uri=${process.env.BACKEND_URL}/api/social/oauth/callback
    &response_type=token
    &scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`;

    return { url: url.replace(/\s+/g, '') };
  }

  @Post('oauth/callback')
  async handleOAuthCallback(@Request() req, @Body() dto: OAuthCallbackDto) {
    return this.socialService.handleOAuthCallback(req.user.userId, dto);
  }
}
