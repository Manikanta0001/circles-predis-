import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SaveContentDto {
  @IsString()
  prompt: string;

  @IsEnum(['text', 'image', 'video'])
  type: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  generatedText?: string;

  @IsOptional()
  @IsString()
  generatedImage?: string;

  @IsOptional()
  @IsString()
  generatedVideo?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  brandId?: string;
}
