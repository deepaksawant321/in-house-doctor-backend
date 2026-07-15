import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP for mobile login' })
  async sendOtpLogin(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtpLogin(sendOtpDto);
  }

  @Post('login-with-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login using mobile OTP' })
  async loginWithOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.loginWithOtp(verifyOtpDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and send OTP' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP to activate user account' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body('refreshToken') refreshTokenValue: string) {
    return this.authService.refreshToken(refreshTokenValue);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Request() req: any, @Body('refreshToken') refreshTokenValue: string) {
    return this.authService.logout(req.user.id, refreshTokenValue);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.id, updateData);
  }
}
