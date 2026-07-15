import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';

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
        supportEmail: 'support@inhousedoctor.com',
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

    Object.assign(setting, data);
    await this.settingRepo.save(setting);
    
    this.logger.log(`Settings updated by admin ${updatedBy}`);

    return { success: true, message: 'Settings updated successfully', data: setting };
  }
}
