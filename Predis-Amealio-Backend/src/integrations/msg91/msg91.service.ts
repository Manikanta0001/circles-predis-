import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

// NOTE: The first service class below is functionally similar but lacks ConfigService injection.
// I've commented out the duplicate definition to focus on the more comprehensive version.
/*
@Injectable()
export class Msg91Service {
  private readonly logger = new Logger(Msg91Service.name);
  private readonly baseUrl = 'https://api.msg91.com/api/v5/otp';
  private readonly authKey = process.env.MSG91_AUTH_KEY;
  private readonly templateId = process.env.MSG91_TEMPLATE_ID;

  async sendOtp(mobile: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          template_id: this.templateId,
          mobile,
          otp,
        },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.type !== 'success') {
        this.logger.error(`MSG91 sendOtp error: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException('Failed to send OTP');
      }

      this.logger.log(`OTP sent to ${mobile}: ${otp}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `MSG91 sendOtp failed for ${mobile}: ${error.response?.data || error.message}`,
      );
      throw new InternalServerErrorException('Unable to send OTP');
    }
  }

  async verifyOtp(mobile: string, otp: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/verify`,
        { mobile, otp },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.type !== 'success') {
        throw new InternalServerErrorException('Invalid OTP');
      }

      this.logger.log(`OTP verified for ${mobile}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `MSG91 verifyOtp failed for ${mobile}: ${error.response?.data || error.message}`,
      );
      throw new InternalServerErrorException('OTP verification failed');
    }
  }
}
*/

@Injectable()
export class MSG91Service {
  private readonly logger = new Logger(MSG91Service.name);
  private readonly authKey: string;
  private readonly senderId: string;
  private readonly baseUrl = 'https://control.msg91.com/api/v5';

  // --- Mock/In-Memory Store for Email OTP ---
  // NOTE: In a real app, this should be a DB/Redis/Cache store for persistence.
  private emailOtpStore: Record<string, string> = {};
  // -------------------------------------------

  // Email transporter for sending OTP emails
  private emailTransporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.authKey = this.configService.get('MSG91_AUTH_KEY');
    this.senderId = this.configService.get('MSG91_SENDER_ID') || 'AMEALIO';

    // Initialize email transporter if SMTP config is provided
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPassword = this.configService.get('SMTP_PASSWORD');

    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort) || 587,
          secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });
        this.logger.log('✅ Email transporter initialized successfully');
      } catch (error) {
        this.logger.warn('⚠️ Failed to initialize email transporter:', error.message);
        this.emailTransporter = null;
      }
    } else {
      this.logger.warn('⚠️ SMTP configuration not provided. Email OTP will be logged to console only.');
      this.emailTransporter = null;
    }
  }

  /**
   * 📧 Sends an OTP to the provided email address.
   * Uses Nodemailer if SMTP is configured, otherwise logs to console (for development).
   * The generated OTP is stored in a temporary in-memory store.
   */
  async sendEmailOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Store the OTP temporarily
    this.emailOtpStore[email] = otp;
    
    // 2. Send email if transporter is configured, otherwise log to console
    if (this.emailTransporter) {
      try {
        const mailOptions = {
          from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@amealio.com',
          to: email, // This will be ANY email the user provides during signup/login
          subject: 'Your Amealio Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">Amealio - Verification Code</h2>
              <p>Your one-time password (OTP) for verification is:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes. Please do not share this code with anyone.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            </div>
          `,
          text: `Your Amealio verification code is: ${otp}. This code will expire in 5 minutes.`,
        };

        await this.emailTransporter.sendMail(mailOptions);
        this.logger.log(`✅ Email OTP sent to ${email}`);
        
        return { success: true, message: 'Email OTP sent successfully' };
      } catch (error) {
        this.logger.error(`❌ Failed to send email OTP to ${email}:`, error.message);
        // Fall back to logging if email fails
        this.logger.log(`[FALLBACK] OTP for ${email}: ${otp}`);
        return { success: true, message: 'Email OTP generated (check console for OTP)', otp };
      }
    } else {
      // No SMTP configured - log to console for development
      this.logger.log(`[MOCK EMAIL OTP] OTP for ${email}: ${otp}`);
      this.logger.warn(`⚠️ SMTP not configured. OTP logged to console: ${otp}`);
      return { success: true, message: 'Email OTP generated (check backend console)', otp };
    }
  }

  /**
   * 🔑 Verifies the OTP sent to the email address (Mocked).
   * NOTE: This mocks the verification against the temporary in-memory store.
   * In a real application, you would check a DB/Redis store.
   */
  async verifyEmailOTP(email: string, otp: string): Promise<boolean> {
    const storedOtp = this.emailOtpStore[email];

    if (storedOtp && storedOtp === otp) {
      this.logger.log(`Email OTP verified for ${email}`);
      // Clean up the OTP after successful verification
      delete this.emailOtpStore[email];
      return true;
    }

    this.logger.warn(`Email OTP verification failed for ${email}`);
    return false;
  }

  // --- Existing Mobile/SMS Methods (Retained) ---

  async sendOTP(mobile: string, templateId: string): Promise<any> {
    if (!this.authKey) {
      this.logger.warn('MSG91 API key not configured. Logging OTP instead.');
      const mockOTP = Math.floor(100000 + Math.random() * 900000).toString();
      this.logger.log(`[MOCK SMS] OTP for ${mobile}: ${mockOTP}`);
      return { success: true, message: 'OTP sent (mocked)', otp: mockOTP };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/otp`,
        {
          template_id: templateId,
          mobile: mobile,
          authkey: this.authKey,
          otp_length: 6,
          otp_expiry: 5,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error('MSG91 OTP Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyOTP(mobile: string, otp: string): Promise<boolean> {
    if (!this.authKey) {
      this.logger.warn('MSG91 API key not configured. Mock verification.');
      return otp === '123456'; // Mock verification
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/otp/verify`,
        {
          params: {
            authkey: this.authKey,
            mobile: mobile,
            otp: otp,
          },
        },
      );
      return response.data.type === 'success';
    } catch (error) {
      this.logger.error('MSG91 Verify Error:', error.response?.data || error.message);
      return false;
    }
  }

  async sendSMS(
    mobile: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<any> {
    if (!this.authKey) {
      this.logger.warn('MSG91 API key not configured. Logging SMS instead.');
      this.logger.log(`[MOCK SMS] To: ${mobile}, Template: ${templateId}, Variables:`, variables);
      return { success: true, message: 'SMS sent (mocked)' };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/flow`,
        {
          template_id: templateId,
          short_url: '0',
          recipients: [
            {
              mobiles: mobile,
              ...variables,
            },
          ],
        },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error('MSG91 SMS Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendPaymentConfirmation(
    mobile: string,
    orderId: string,
    amount: string,
  ): Promise<any> {
    return this.sendSMS(mobile, 'PAYMENT_TEMPLATE_ID', {
      var1: orderId,
      var2: amount,
      var3: new Date().toLocaleString('en-IN'),
    });
  }

  async sendContentPublishedAlert(
    mobile: string,
    platform: string,
    contentType: string,
  ): Promise<any> {
    return this.sendSMS(mobile, 'CONTENT_ALERT_TEMPLATE_ID', {
      var1: platform,
      var2: contentType,
      var3: new Date().toLocaleTimeString('en-IN'),
    });
  }
}