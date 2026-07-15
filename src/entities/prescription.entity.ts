import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';

@Entity('Prescriptions')
export class Prescription extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'PrescriptionId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @Column({ name: 'FileName', type: 'nvarchar', length: 255 })
  fileName: string;

  @Column({ name: 'FilePath', type: 'nvarchar', length: 500 })
  filePath: string;

  @CreateDateColumn({ name: 'UploadedDate' })
  uploadedDate: Date;
}
