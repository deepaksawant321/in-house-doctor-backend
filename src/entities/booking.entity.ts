import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Entity('Bookings')
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'BookingId', type: 'bigint' })
  id: string;

  @Column({ name: 'BookingNo', type: 'varchar', length: 50, nullable: true })
  bookingNo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserId' })
  user: User;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'PatientId' })
  patient: Patient;

  @Column({ name: 'ServiceId', type: 'int', nullable: true })
  serviceId: number;

  @Column({ name: 'AddressId', type: 'bigint', nullable: true })
  addressId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'DoctorId' })
  doctor: Doctor;

  @Column({ name: 'Symptoms', type: 'nvarchar', length: 'MAX', nullable: true })
  symptoms: string;

  @Column({ name: 'PreferredDate', type: 'date' })
  scheduledDate: Date; // mapped to scheduledDate in code to avoid service changes if possible

  @Column({ name: 'PreferredTime', type: 'varchar', length: 20, nullable: true })
  preferredTime: string;

  @Column({
    name: 'BookingStatus',
    type: 'varchar',
    length: 50,
    default: BookingStatus.Created,
  })
  status: string; // mapped to status to minimize service changes

  @Column({ name: 'PaymentStatus', type: 'varchar', length: 50, default: 'Pending' })
  paymentStatus: string;

  @Column({ name: 'Amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
