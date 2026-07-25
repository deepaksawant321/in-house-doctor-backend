import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('OTPVerifications')
export class OTPVerification extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'OTPId', type: 'bigint' })
  id: string;

  @Column({ name: 'UserId', type: 'varchar', length: 50, nullable: true })
  userId: string;

  @Column({ name: 'Email', type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'OTPHash', type: 'varchar', length: 255 })
  otpHash: string;

  @Column({ name: 'Purpose', type: 'varchar', length: 50 })
  purpose: string;

  @Column({ name: 'Channel', type: 'varchar', length: 50 })
  channel: string;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'IsVerified', type: 'bit', default: false })
  isUsed: boolean;

  @Column({ name: 'AttemptCount', type: 'int', default: 0 })
  attemptCount: number;

  @Column({ name: 'VerifiedAt', type: 'datetime', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'IPAddress', type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'UserAgent', type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
