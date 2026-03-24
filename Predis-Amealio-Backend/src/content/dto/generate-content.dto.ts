import { IsString, IsOptional, IsEnum } from 'class-validator';

export class GenerateContentDto {
  @IsString()
  prompt: string;

  @IsEnum(['text', 'image', 'video'])
  type: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  textType?: string;

  @IsOptional()
  @IsEnum(['professional', 'casual'])
  tone?: string;

  // Optional image-related options
  @IsOptional()
  aspectRatio?: string;

  @IsOptional()
  textOverlay?: boolean;

  @IsOptional()
  overlayText?: string;

  // Optional video-related options
  @IsOptional()
  videoType?: string;

  @IsOptional()
  duration?: string;

  @IsOptional()
  @IsString()
  brandId?: string;
}
