import { IsString, IsOptional, IsDateString } from 'class-validator';

export class PublishContentDto {
  @IsString()
  contentId: string;

  @IsString()
  accountId: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;
}
