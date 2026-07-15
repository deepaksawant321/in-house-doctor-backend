import { Entity , PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('Settings')
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'SettingId' })
  id: number;

  @Column({ name: 'SettingKey', nullable: true })
  settingKey: string;

  @Column({ name: 'SettingValue', nullable: true })
  settingValue: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  supportEmail: string;

  @Column({ nullable: true })
  supportPhone: string;

  @Column({ nullable: true })
  whatsappNumber: string;

  @Column({ nullable: true })
  primaryUpiId: string;

  @Column({ nullable: true })
  qrCodeImage: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ nullable: true })
  socialFacebook: string;

  @Column({ nullable: true })
  socialInstagram: string;

  @Column({ nullable: true })
  socialTwitter: string;

  @Column({ nullable: true })
  googleMapsLink: string;

  @Column({ nullable: true })
  bookingPrefix: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  smsTemplates: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  emailTemplates: string;
}
