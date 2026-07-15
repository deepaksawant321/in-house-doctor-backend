import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('OTPLogs')
export class OTPLog {
  @PrimaryGeneratedColumn({ name: 'OTPLogId', type: 'bigint' })
  id: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 15, nullable: true })
  mobileNo: string;

  @Column({ name: 'OTPCode', type: 'varchar', length: 10, nullable: true })
  otpCode: string;

  @Column({ name: 'ProviderName', type: 'varchar', length: 50, nullable: true })
  providerName: string;

  @Column({ name: 'ProviderResponse', type: 'nvarchar', length: 'MAX', nullable: true })
  providerResponse: string;

  @Column({ name: 'SMSStatus', type: 'varchar', length: 50, nullable: true })
  smsStatus: string;

  @CreateDateColumn({ name: 'SentDate' })
  sentDate: Date;
}
