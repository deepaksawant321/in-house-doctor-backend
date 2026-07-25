import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { UserSession } from '../../entities/user-session.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    @InjectRepository(UserSession)
    private sessionRepo: Repository<UserSession>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async sendOtpLogin(sendOtpDto: SendOtpDto) {
    let user;
    if (sendOtpDto.channel === 'EMAIL') {
      user = await this.usersService.findByEmail(sendOtpDto.identifier);
    } else {
      user = await this.usersService.findByPhone(sendOtpDto.identifier);
    }

    if (!user) {
      user = await this.usersService.create({
        fullName: 'Guest User',
        email: sendOtpDto.channel === 'EMAIL' ? sendOtpDto.identifier : `guest_${Date.now()}@inhousedoctor.com`,
        phoneNumber: sendOtpDto.channel === 'SMS' ? sendOtpDto.identifier : Date.now().toString().substring(0, 15),
        isVerified: false,
        status: 'Active'
      });
    }

    const otpCode = await this.otpService.generateOtp(sendOtpDto.identifier, sendOtpDto.channel, sendOtpDto.purpose);
    return {
      success: true,
      message: 'OTP sent successfully',
      data: { devOtpHint: otpCode }
    };
  }

  async loginWithOtp(verifyOtpDto: VerifyOtpDto) {
    await this.otpService.verifyOtp(verifyOtpDto.identifier, verifyOtpDto.otp, verifyOtpDto.purpose);

    let user;
    if (verifyOtpDto.identifier.includes('@')) {
      user = await this.usersService.findByEmail(verifyOtpDto.identifier);
    } else {
      user = await this.usersService.findByPhone(verifyOtpDto.identifier);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isVerified) {
      await this.usersService.update(user.id, { isVerified: true });
      user.isVerified = true;
    }

    const payload = { sub: user.id, email: user.email, role: 'Patient' };
    const accessToken = this.jwtService.sign(payload);
    const refreshTokenValue = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Persist session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await this.sessionRepo.save(
      this.sessionRepo.create({
        user: { id: user.id } as any,
        accessToken,
        refreshToken: refreshTokenValue,
        expiresAt,
        isActive: true,
      }),
    );

    // Persist refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        user: { id: user.id } as any,
        token: refreshTokenValue,
        expiryDate: refreshExpiry,
        isRevoked: false,
      }),
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          role: 'Patient',
        },
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      fullName: `${registerDto.firstName} ${registerDto.lastName}`,
      email: registerDto.email,
      phoneNumber: registerDto.phoneNumber,
      isVerified: false,
      status: 'Active'
    });

    const otpCode = await this.otpService.generateOtp(user.phoneNumber, 'SMS', 'REGISTER');

    return {
      success: true,
      message: 'User registered successfully. Please verify OTP sent to your phone.',
      data: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        devOtpHint: otpCode, // Included only for testing in this dev phase
      },
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    await this.otpService.verifyOtp(verifyOtpDto.identifier, verifyOtpDto.otp, verifyOtpDto.purpose);
    
    let user;
    if (verifyOtpDto.identifier.includes('@')) {
      user = await this.usersService.findByEmail(verifyOtpDto.identifier);
    } else {
      user = await this.usersService.findByPhone(verifyOtpDto.identifier);
    }
    
    if (user && !user.isVerified) {
      await this.usersService.update(user.id, { isVerified: true });
    }

    return {
      success: true,
      message: 'Phone number verified successfully. Account is now active.',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Account not activated. Please verify your OTP first.');
    }

    // Passwords are no longer stored in the Users table per DB schema, this flow might not work for patients natively.
    // Assuming LoginDto is not the primary way for patients right now.
    // If it's used, we will fail here because we removed passwordHash.
    throw new UnauthorizedException('Please login with OTP');
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async updateProfile(userId: string, updateData: any) {
    return this.usersService.update(userId, updateData);
  }

  async refreshToken(refreshTokenValue: string) {
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshTokenValue, isRevoked: false },
      relations: { user: true }
    });

    if (!tokenRecord || tokenRecord.expiryDate < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = { sub: tokenRecord.user.id, email: tokenRecord.user.email, role: 'Patient' };
    const newAccessToken = this.jwtService.sign(payload);

    return {
      success: true,
      data: {
        accessToken: newAccessToken
      }
    };
  }

  async logout(userId: string, refreshTokenValue: string) {
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: { token: refreshTokenValue, user: { id: userId } }
    });

    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await this.refreshTokenRepo.save(tokenRecord);
    }

    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
}
