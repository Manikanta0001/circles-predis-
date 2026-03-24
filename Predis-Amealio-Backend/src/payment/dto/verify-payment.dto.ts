import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  orderId: string;

  @IsString()
  paymentId: string;

  @IsString()
  signature: string;
}
