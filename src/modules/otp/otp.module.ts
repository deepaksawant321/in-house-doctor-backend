import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './otp.service';
import { OTPVerification } from '../../entities/otp-verification.entity';
import { OTPLog } from '../../entities/otplog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OTPVerification, OTPLog])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
