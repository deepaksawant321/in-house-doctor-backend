import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class Msg91Provider implements ISmsProvider {
  private readonly logger = new Logger(Msg91Provider.name);
  
  // In a real application, you would inject ConfigService to get the API key
  // private readonly apiKey = this.configService.get<string>('MSG91_API_KEY');

  async sendSms(mobile: string, message: string): Promise<boolean> {
    this.logger.log(`[MSG91] Sending SMS to ${mobile}: ${message}`);
    
    /* 
    Example implementation:
    const response = await axios.post('https://api.msg91.com/api/v5/otp', {
      template_id: 'your_template_id',
      mobile: mobile,
      authkey: this.apiKey,
      otp: message // Assuming the message contains the OTP
    });
    return response.data.type === 'success';
    */
    
    return true; // Mock success
  }
}
