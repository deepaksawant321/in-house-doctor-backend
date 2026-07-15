import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { Booking } from './booking.entity';

@Entity('MedicalRecords')
export class MedicalRecord extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'RecordId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'PatientId' })
  patient: Patient;

  @ManyToOne(() => Doctor, { nullable: true })
  @JoinColumn({ name: 'DoctorId' })
  doctor: Doctor;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @Column({ name: 'FileUrl', type: 'nvarchar', length: 1000 })
  fileUrl: string;

  @Column({ name: 'FileName', type: 'nvarchar', length: 255, nullable: true })
  fileName: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ name: 'RecordType', type: 'varchar', length: 50, nullable: true })
  recordType: string;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
