export interface ISmsProvider {
  sendSms(mobile: string, message: string): Promise<boolean>;
}
