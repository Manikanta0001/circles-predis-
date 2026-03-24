import { Controller, Get, Query } from '@nestjs/common';
import { SocialService } from './_social.service';

@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // Step 1: Frontend hits this to get IG Business Login URL
  @Get('oauth')
  getFacebookLoginUrl() {
    return this.socialService.generateLoginUrl();
  }

  // Step 2: Facebook redirects here after login
  @Get('oauth/callback')
  async facebookCallback(@Query() query: any) {
    return this.socialService.handleFacebookCallback(query);
  }
}
