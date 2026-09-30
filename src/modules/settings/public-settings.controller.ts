import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';

/** Public, read-only subset of the site settings (contact details, payment instructions). */
@ApiTags('Settings')
@Controller('api/settings')
export class PublicSettingsController {
  constructor(@InjectRepository(Setting) private readonly settingRepo: Repository<Setting>) {}

  @Get()
  @ApiOperation({ summary: 'Public site settings (contact details, UPI payment info)' })
  async get() {
    const s: any = (await this.settingRepo.find({ order: { id: 'ASC' } as any, take: 1 }))[0] || {};
    return {
      success: true,
      data: {
        companyName: s.companyName ?? null,
        supportEmail: s.supportEmail ?? null,
        supportPhone: s.supportPhone ?? null,
        whatsappNumber: s.whatsappNumber ?? null,
        primaryUpiId: s.primaryUpiId ?? null,
        qrCodeImage: s.qrCodeImage ?? null,
        logoUrl: s.logoUrl ?? null,
        googleMapsLink: s.googleMapsLink ?? null,
        socialFacebook: s.socialFacebook ?? null,
        socialInstagram: s.socialInstagram ?? null,
        socialTwitter: s.socialTwitter ?? null,
      },
    };
  }
}
