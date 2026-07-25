import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from '../interfaces/otp-provider.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(EmailOtpProvider.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(target: string, otp: string, templateContext?: any): Promise<boolean> {
    this.logger.log(`[EmailProvider] Sending OTP to ${target}. OTP Code is: ${otp}`);
    
    try {
      await this.mailerService.sendMail({
        to: target,
        subject: 'Your Login OTP - Doctor Doorstep',
        text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Doctor Doorstep Login</h2>
            <p>Your One-Time Password (OTP) for login is:</p>
            <h1 style="color: #4facfe; letter-spacing: 5px;">${otp}</h1>
            <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
          </div>
        `,
      });
      this.logger.log(`[EmailProvider] Successfully sent OTP to ${target}`);
      return true;
    } catch (error) {
      this.logger.error(`[EmailProvider] Failed to send OTP to ${target}: ${error.message}`, error.stack);
      // We don't want to crash the app if email fails to send, but we log the error.
      return false;
    }
  }
}
