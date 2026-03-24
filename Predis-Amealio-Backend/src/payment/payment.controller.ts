import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-order')
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.paymentService.createOrder(req.user.userId, dto);
  }

  @Post('verify')
  async verifyPayment(@Request() req, @Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(req.user.userId, dto);
  }

  @Get('history')
  async getHistory(@Request() req) {
    return this.paymentService.getPaymentHistory(req.user.userId);
  }

  @Post('refund/:id')
  async refund(@Request() req, @Param('id') paymentId: string) {
    return this.paymentService.refundPayment(req.user.userId, paymentId);
  }
}
