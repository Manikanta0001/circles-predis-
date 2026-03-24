import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get('RAZORPAY_KEY_ID');
    this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (this.keyId && this.keySecret) {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
    } else {
      this.logger.warn('Razorpay credentials not configured. Using mock mode.');
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt?: string
  ): Promise<any> {
    if (!this.razorpay) {
      this.logger.warn('Razorpay not configured. Creating mock order.');
      return {
        id: `order_mock_${Date.now()}`,
        entity: 'order',
        amount: amount,
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        status: 'created',
        created_at: Date.now(),
      };
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
      });
      return order;
    } catch (error) {
      this.logger.error('Razorpay Order Creation Error:', error);
      throw error;
    }
  }

  async verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    if (!this.razorpay) {
      this.logger.warn('Razorpay not configured. Mock verification.');
      return true; // Mock successful verification
    }

    try {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      this.logger.error('Signature Verification Error:', error);
      return false;
    }
  }

  async fetchPayment(paymentId: string): Promise<any> {
    if (!this.razorpay) {
      this.logger.warn('Razorpay not configured. Mock payment fetch.');
      return {
        id: paymentId,
        entity: 'payment',
        amount: 50000,
        currency: 'INR',
        status: 'captured',
        method: 'card',
      };
    }

    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      this.logger.error('Razorpay Payment Fetch Error:', error);
      throw error;
    }
  }

  async createRefund(
    paymentId: string,
    amount?: number
  ): Promise<any> {
    if (!this.razorpay) {
      this.logger.warn('Razorpay not configured. Mock refund.');
      return {
        id: `rfnd_mock_${Date.now()}`,
        entity: 'refund',
        amount: amount || 50000,
        payment_id: paymentId,
        status: 'processed',
      };
    }

    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount,
      });
      return refund;
    } catch (error) {
      this.logger.error('Razorpay Refund Error:', error);
      throw error;
    }
  }
}
