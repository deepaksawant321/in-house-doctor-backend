import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otp.service';
import { OTPVerification } from '../../entities/otp-verification.entity';
import { OTPLog } from '../../entities/otplog.entity';
import { EmailOtpProvider } from './providers/email-otp.provider';
import { SmsOtpProvider } from './providers/sms-otp.provider';

@Module({
  imports: [TypeOrmModule.forFeature([OTPVerification, OTPLog])],
  providers: [OtpService, EmailOtpProvider, SmsOtpProvider],
  exports: [OtpService],
})
export class OtpModule {}
