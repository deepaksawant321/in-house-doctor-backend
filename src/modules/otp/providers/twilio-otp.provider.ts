import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class TwilioProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioProvider.name);

  // In a real application, you would inject ConfigService to get the SID and Auth Token
  // private readonly accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
  // private readonly authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
  // private readonly fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER');

  async sendSms(mobile: string, message: string): Promise<boolean> {
    this.logger.log(`[Twilio] Sending SMS to ${mobile}: ${message}`);
    
    /* 
    Example implementation:
    const client = require('twilio')(this.accountSid, this.authToken);
    await client.messages.create({
      body: message,
      from: this.fromNumber,
      to: mobile
    });
    return true;
    */
    
    return true; // Mock success
  }
}
