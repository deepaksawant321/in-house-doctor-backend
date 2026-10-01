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

  // In-memory brute-force guard: max 5 failed verifications per target+purpose in 10 minutes
  private failedAttempts = new Map<string, { count: number; resetAt: number }>();
  private static readonly MAX_FAILED = 5;
  private static readonly FAIL_WINDOW_MS = 10 * 60 * 1000;

  private attemptKey(target: string, purpose: string) {
    return `${target.toLowerCase()}|${purpose}`;
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * DEVELOPMENT ONLY: when DEV_FIXED_OTP is set (e.g. 111111) every OTP is that value. It is ignored when
   * NODE_ENV=production, and main.ts refuses to boot in production with it set.
   */
  private fixedDevOtp(): string | null {
    const fixed = process.env.DEV_FIXED_OTP?.trim();
    if (!fixed || process.env.NODE_ENV === 'production') return null;
    return fixed;
  }

  async generateOtp(target: string, channel: 'EMAIL' | 'SMS', purpose: string): Promise<string> {
    const fixedOtp = this.fixedDevOtp();

    if (!fixedOtp) {
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
    }

    const otpCode = fixedOtp ?? Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
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

    if (fixedOtp) {
      // Nothing is emailed/texted in fixed-OTP mode; the code is the configured DEV_FIXED_OTP.
      this.logger.warn(`DEV_FIXED_OTP is active: OTP for ${target} (${purpose}) was not sent, use the fixed code`);
      return otpCode;
    }

    let provider: IOtpProvider = channel === 'EMAIL' ? this.emailProvider : this.smsProvider;
    await provider.sendOtp(target, otpCode);

    return otpCode;
  }

  async verifyOtp(target: string, otpCode: string, purpose: string): Promise<boolean> {
    const key = this.attemptKey(target, purpose);
    const now = Date.now();
    const attempts = this.failedAttempts.get(key);
    if (attempts && attempts.resetAt > now && attempts.count >= OtpService.MAX_FAILED) {
      throw new BadRequestException('Too many incorrect attempts. Please request a new OTP later.');
    }
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
      const current = attempts && attempts.resetAt > now ? attempts : { count: 0, resetAt: now + OtpService.FAIL_WINDOW_MS };
      current.count += 1;
      this.failedAttempts.set(key, current);
      throw new BadRequestException('Invalid or expired OTP');
    }
    this.failedAttempts.delete(key);

    otpRecord.isUsed = true;
    otpRecord.verifiedAt = new Date();
    await this.otpRepo.save(otpRecord);
    
    return true;
  }
}
