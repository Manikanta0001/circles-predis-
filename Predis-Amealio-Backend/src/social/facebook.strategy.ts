import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/social/oauth/callback`,
      profileFields: ['id', 'displayName', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { accessToken, profile };
  }
}
