export interface IOtpProvider {
  sendOtp(target: string, otp: string, templateContext?: any): Promise<boolean>;
}
