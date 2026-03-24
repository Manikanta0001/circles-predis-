import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ConnectSocialDto {
  @IsString()
  platform: string;

  @IsString()
  accountName: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
