import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';

@Entity('BookingStatusHistory')
export class BookingStatusHistory extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'HistoryId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @Column({ name: 'OldStatus', type: 'varchar', length: 50, nullable: true })
  oldStatus: string;

  @Column({ name: 'NewStatus', type: 'varchar', length: 50 })
  newStatus: string;

  @Column({ name: 'Remarks', type: 'nvarchar', length: 'MAX', nullable: true })
  remarks: string;

  @Column({ name: 'ChangedBy', type: 'bigint', nullable: true })
  changedBy: string;

  @CreateDateColumn({ name: 'ChangedDate' })
  changedDate: Date;
}
