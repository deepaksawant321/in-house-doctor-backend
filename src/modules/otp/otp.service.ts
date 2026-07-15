import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { OTPVerification } from '../../entities/otp-verification.entity';
import { OTPLog } from '../../entities/otplog.entity';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(OTPVerification)
    private otpRepo: Repository<OTPVerification>,
    @InjectRepository(OTPLog)
    private otpLogRepo: Repository<OTPLog>,
  ) {}

  async generateOtp(phoneNumber: string): Promise<string> {
    // Generate 4 digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpRecord = this.otpRepo.create({
      phoneNumber,
      otpCode,
      expiresAt,
    });

    await this.otpRepo.save(otpRecord);

    // Log the OTP dispatch to OTPLogs table
    await this.otpLogRepo.save(
      this.otpLogRepo.create({
        mobileNo: phoneNumber,
        otpCode,
        providerName: 'DEV_MOCK',
        providerResponse: 'OTP generated in dev mode',
        smsStatus: 'Sent',
      }),
    );

    // In a real scenario, integrate an SMS provider here.
    this.logger.log(`[DEV ONLY] Generated OTP ${otpCode} for phone ${phoneNumber}`);
    return otpCode;
  }

  async verifyOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    const otpRecord = await this.otpRepo.findOne({
      where: {
        phoneNumber,
        otpCode,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdDate: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    otpRecord.isUsed = true;
    await this.otpRepo.save(otpRecord);
    return true;
  }
}
