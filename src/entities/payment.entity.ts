import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';

@Entity('Payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'PaymentId', type: 'bigint' })
  id: string;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @Column({ name: 'Amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'UPIReferenceNo', type: 'varchar', length: 100, nullable: true })
  transactionId: string; // mapped to transactionId for existing logic

  @Column({ name: 'ScreenshotPath', type: 'nvarchar', length: 500, nullable: true })
  screenshotPath: string;

  @Column({ name: 'PaymentStatus', type: 'varchar', length: 50, default: 'Pending' })
  status: string; // mapped to status for existing logic

  @Column({ name: 'VerifiedBy', type: 'bigint', nullable: true })
  verifiedBy: string;

  @Column({ name: 'VerifiedDate', type: 'datetime', nullable: true })
  verifiedDate: Date;

  @Column({ name: 'Remarks', type: 'nvarchar', length: 'MAX', nullable: true })
  remarks: string;
}
