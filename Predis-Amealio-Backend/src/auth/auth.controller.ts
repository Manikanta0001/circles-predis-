import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** USER SIGNUP */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** USER LOGIN */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // -------------------------------------
  // OTP ENDPOINTS REMOVED / COMMENTED OUT
  // -------------------------------------

  /*
  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyEmailOtp(body.email, body.otp);
  }

  @Post('resend-email-otp')
  async resendEmailOtp(@Body() body: { email: string }) {
    return this.authService.resendEmailOtp(body.email);
  }
  */

  /** GET LOGGED-IN USER PROFILE */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}
