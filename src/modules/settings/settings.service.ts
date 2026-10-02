import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';

const EDITABLE_FIELDS = [
  'companyName', 'supportEmail', 'supportPhone', 'whatsappNumber', 'primaryUpiId', 'qrCodeImage', 'logoUrl',
  'faviconUrl', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'googleMapsLink', 'bookingPrefix',
  'smsTemplates', 'emailTemplates',
] as const;

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  async getSettings(): Promise<any> {
    let setting = await this.settingRepo.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepo.create({
        companyName: 'InHouse Doctor',
        supportEmail: 'support@doctordoorstep.com',
        supportPhone: '1800-123-4567',
        whatsappNumber: '+91 9876543210',
        primaryUpiId: 'pay.inhousedoctor@upi',
      });
      await this.settingRepo.save(setting);
    }
    return { success: true, data: setting };
  }

  async updateSettings(data: any, updatedBy: string): Promise<any> {
    let setting = await this.settingRepo.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepo.create({});
    }

    // Whitelist: never let the request body overwrite the key/ids or unknown columns
    for (const field of EDITABLE_FIELDS) {
      if (data && Object.prototype.hasOwnProperty.call(data, field)) {
        const v = data[field];
        (setting as any)[field] = v === null || v === undefined ? null : String(v).slice(0, 2000);
      }
    }
    await this.settingRepo.save(setting);
    
    this.logger.log(`Settings updated by admin ${updatedBy}`);

    return { success: true, message: 'Settings updated successfully', data: setting };
  }
}
