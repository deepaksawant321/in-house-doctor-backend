import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('OTPVerifications')
export class OTPVerification extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'OTPId', type: 'bigint' })
  id: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'OTPCode', type: 'varchar', length: 10 })
  otpCode: string;

  @Column({ name: 'OTPType', type: 'varchar', length: 50, nullable: true })
  otpType: string;

  @Column({ name: 'ExpiresAt', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'IsVerified', type: 'bit', default: false })
  isUsed: boolean; // Map IsVerified to isUsed to keep service logic same

  @Column({ name: 'AttemptCount', type: 'int', default: 0 })
  attemptCount: number;

  @Column({ name: 'VerifiedAt', type: 'datetime', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
