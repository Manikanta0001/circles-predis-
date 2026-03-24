import { IsString } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  platform: string;

  @IsString()
  code: string;

  @IsString()
  redirectUri: string;
}
