import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../common/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
// All OTP + MSG91 removed

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * USER SIGNUP
   * - Check if email exists
   * - Hash password
   * - Save user in DB
   * - Return JWT + User data
   */
  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      companyName: dto.companyName,
      role: 'merchant',
      subscriptionTier: 'free',
    });

    await this.userRepository.save(user);

    // OTP removed
    // await this.msg91Service.sendEmailOTP(user.email);

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
      },
    };
  }

  /**
   * USER LOGIN
   * - Check if email exists → if not, ask to sign up
   * - Validate password
   * - Return JWT + user info
   */
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found. Please sign up first.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses OAuth login. Please sign in with Google.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        role: user.role,
      },
    };
  }

  // -------------------------------
  // OTP FUNCTIONS (FULLY DISABLED)
  // -------------------------------
  /*
  async verifyEmailOtp(email: string, otp: string) {
    const isValid = await this.msg91Service.verifyEmailOTP(email, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    };
  }

  async resendEmailOtp(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.msg91Service.sendEmailOTP(email);
    return {
      message: 'OTP resent to your email',
      email,
    };
  }
  */

  /**
   * Get logged-in user's profile
   */
  async getProfile(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        subscriptionTier: true,
        credits: true,
        companyName: true,
        profileImage: true,
      },
    });
  }

  /**
   * Validate user by ID (JWT guard usage)
   */
  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT Token
   */
  private generateToken(userId: string, email: string, role: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }
}
