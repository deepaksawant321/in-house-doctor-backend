import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { OTPVerification } from '../../entities/otp-verification.entity';
import { OTPLog } from '../../entities/otplog.entity';
import { IOtpProvider } from './interfaces/otp-provider.interface';
import { EmailOtpProvider } from './providers/email-otp.provider';
import { SmsOtpProvider } from './providers/sms-otp.provider';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(OTPVerification)
    private otpRepo: Repository<OTPVerification>,
    @InjectRepository(OTPLog)
    private otpLogRepo: Repository<OTPLog>,
    private readonly emailProvider: EmailOtpProvider,
    private readonly smsProvider: SmsOtpProvider,
  ) {}

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async generateOtp(target: string, channel: 'EMAIL' | 'SMS', purpose: string): Promise<string> {
    // SECURITY HARDENING: Cooldown Enforcement (60 seconds)
    const recentOtp = await this.otpRepo.createQueryBuilder('otp')
      .where('(otp.email = :target OR otp.phoneNumber = :target)', { target })
      .andWhere('otp.purpose = :purpose', { purpose })
      .andWhere('otp.createdDate > :date', { date: new Date(Date.now() - 60000) })
      .getOne();

    if (recentOtp) {
      throw new BadRequestException('Please wait 60 seconds before requesting another OTP');
    }

    // SECURITY HARDENING: Daily Rate Limit (Max 5 per day)
    const dailyCount = await this.otpRepo.createQueryBuilder('otp')
      .where('(otp.email = :target OR otp.phoneNumber = :target)', { target })
      .andWhere('otp.purpose = :purpose', { purpose })
      .andWhere('otp.createdDate > :date', { date: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      .getCount();

    if (dailyCount >= 5) {
      throw new BadRequestException('Maximum daily OTP limit reached. Please try again tomorrow.');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const otpHash = this.hashOtp(otpCode);

    const otpRecord = this.otpRepo.create({
      email: channel === 'EMAIL' ? target : null,
      phoneNumber: channel === 'SMS' ? target : null,
      otpHash,
      channel,
      purpose,
      expiresAt,
    } as any);

    await this.otpRepo.save(otpRecord);

    let provider: IOtpProvider = channel === 'EMAIL' ? this.emailProvider : this.smsProvider;
    await provider.sendOtp(target, otpCode);

    return otpCode;
  }

  async verifyOtp(target: string, otpCode: string, purpose: string): Promise<boolean> {
    const otpHash = this.hashOtp(otpCode);

    const otpRecord = await this.otpRepo.createQueryBuilder('otp')
      .where('(otp.email = :target OR otp.phoneNumber = :target)', { target })
      .andWhere('otp.otpHash = :otpHash', { otpHash })
      .andWhere('otp.purpose = :purpose', { purpose })
      .andWhere('otp.isUsed = :isUsed', { isUsed: false })
      .andWhere('otp.expiresAt > :date', { date: new Date() })
      .orderBy('otp.createdDate', 'DESC')
      .getOne();

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otpRecord.isUsed = true;
    otpRecord.verifiedAt = new Date();
    await this.otpRepo.save(otpRecord);
    
    return true;
  }
}
