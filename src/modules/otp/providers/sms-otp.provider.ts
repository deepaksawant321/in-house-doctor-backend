import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from '../interfaces/otp-provider.interface';
import { ISmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class SmsOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(SmsOtpProvider.name);

  // Future: Inject active ISmsProvider (Msg91, Twilio, etc) based on config
  // constructor(private readonly smsProvider: ISmsProvider) {}

  async sendOtp(target: string, otp: string, templateContext?: any): Promise<boolean> {
    this.logger.log(`[SmsProvider] Sending OTP to ${target}`);
    // await this.smsProvider.sendSms(target, \`Your OTP is \${otp}\`);
    return true;
  }
}
