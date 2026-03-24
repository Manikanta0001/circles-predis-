import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SocialService {
  generateLoginUrl() {
    const appId = process.env.FB_APP_ID;
    const redirect = `${process.env.BACKEND_URL}/api/social/oauth/callback`;

    const url = `https://www.facebook.com/v20.0/dialog/oauth
      ?client_id=${appId}
      &display=page
      &extras={"setup":{"channel":"IG_API_ONBOARDING"}}
      &redirect_uri=${redirect}
      &response_type=token
      &scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement`;

    return { url: url.replace(/\s+/g, '') };
  }

  async handleFacebookCallback(query: any) {
    const longToken = query.long_lived_token;

    if (!longToken) {
      return {
        error: 'No long-lived token received from Facebook',
        query,
      };
    }

    // Step 4 – Fetch pages & IG account
    const pages = await axios.get(
      'https://graph.facebook.com/v20.0/me/accounts',
      {
        params: {
          fields: 'id,name,access_token,instagram_business_account',
          access_token: longToken,
        },
      },
    );

    return {
      longLivedToken: longToken,
      pages: pages.data.data,
    };
  }
}
