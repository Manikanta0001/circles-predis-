import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../common/entities/payment.entity';
import { Transaction } from '../common/entities/transaction.entity';
import { User } from '../common/entities/user.entity';
import { RazorpayService } from '../integrations/razorpay/razorpay.service';
import { MSG91Service } from '../integrations/msg91/msg91.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private razorpay: RazorpayService,
    private msg91: MSG91Service,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Create Razorpay order
    const razorpayOrder = await this.razorpay.createOrder(
      dto.amount,
      dto.currency || 'INR',
      dto.receipt
    );

    // Save to database
    const payment = this.paymentRepository.create({
      userId,
      orderId: razorpayOrder.id,
      amount: dto.amount,
      currency: dto.currency || 'INR',
      status: 'pending',
      provider: 'razorpay',
    });

    await this.paymentRepository.save(payment);

    return {
      ...razorpayOrder,
      paymentId: payment.id,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    // Verify signature
    const isValid = await this.razorpay.verifyPaymentSignature(
      dto.orderId,
      dto.paymentId,
      dto.signature
    );

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment in database
    await this.paymentRepository.update(
      { orderId: dto.orderId },
      {
        paymentId: dto.paymentId,
        status: 'completed',
        completedAt: new Date(),
      }
    );

    const payment = await this.paymentRepository.findOne({
      where: { orderId: dto.orderId },
    });

    // Add credits to user based on amount
    const creditsToAdd = Math.floor(payment.amount / 100); // 1 credit per rupee
    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.credits += creditsToAdd;
    await this.userRepository.save(user);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      userId,
      type: 'purchase',
      amount: creditsToAdd,
      description: `Credit purchase - Order ${payment.orderId}`,
      status: 'completed',
    });
    await this.transactionRepository.save(transaction);

    // Send SMS confirmation
    if (user) {
      await this.msg91.sendPaymentConfirmation(
        user.email, // Mock phone number with email
        payment.orderId,
        (payment.amount / 100).toString()
      );
    }

    return {
      success: true,
      creditsAdded: creditsToAdd,
      payment,
    };
  }

  async getPaymentHistory(userId: string) {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async refundPayment(userId: string, paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment || !payment.paymentId) {
      throw new Error('Payment not found');
    }

    // Process refund through Razorpay
    const refund = await this.razorpay.createRefund(payment.paymentId);

    // Update payment status
    await this.paymentRepository.update(
      { id: paymentId },
      { status: 'refunded' }
    );

    // Deduct credits
    const creditsToDeduct = Math.floor(payment.amount / 100);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    user.credits -= creditsToDeduct;
    await this.userRepository.save(user);

    // Create refund transaction
    const transaction = this.transactionRepository.create({
      userId,
      type: 'refund',
      amount: -creditsToDeduct,
      description: `Refund - Order ${payment.orderId}`,
      status: 'completed',
    });
    await this.transactionRepository.save(transaction);

    return { success: true, refund };
  }
}
