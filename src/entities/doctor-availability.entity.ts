import { Entity, Column, ManyToOne, JoinColumn , PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Doctor } from './doctor.entity';

@Entity('DoctorAvailability')
export class DoctorAvailability extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'DoctorId' })
  doctor: Doctor;

  @Column({ name: 'DayOfWeek', type: 'int' }) // 0 = Sunday, 1 = Monday, etc.
  dayOfWeek: number;

  @Column({ name: 'StartTime', type: 'time' })
  startTime: string;

  @Column({ name: 'EndTime', type: 'time' })
  endTime: string;

  @Column({ name: 'IsAvailable', type: 'bit', default: true })
  isAvailable: boolean;
}
