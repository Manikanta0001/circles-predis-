import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  amount: number; // in paise

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  receipt?: string;
}
