import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from '../common/entities/payment.entity';
import { Transaction } from '../common/entities/transaction.entity';
import { User } from '../common/entities/user.entity';
import { RazorpayModule } from '../integrations/razorpay/razorpay.module';
import { MSG91Module } from '../integrations/msg91/msg91.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Transaction, User]),
    RazorpayModule,
    MSG91Module,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
