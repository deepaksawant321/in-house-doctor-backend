import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';
import { Doctor } from './doctor.entity';

@Entity('DoctorAssignments')
export class DoctorAssignment extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'AssignmentId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'DoctorId' })
  doctor: Doctor;

  @Column({ name: 'AssignedBy', type: 'bigint', nullable: true })
  assignedBy: string;

  @CreateDateColumn({ name: 'AssignedDate' })
  assignedDate: Date;

  @Column({ name: 'AssignmentStatus', type: 'varchar', length: 50, default: 'Active' })
  status: string;
}
