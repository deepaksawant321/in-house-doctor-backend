import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
@Entity('Doctors')
export class Doctor extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'DoctorId', type: 'bigint' })
  id: string;

  @Column({ name: 'DoctorName', type: 'nvarchar', length: 100 })
  name: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'Qualification', type: 'nvarchar', length: 100, nullable: true })
  qualification: string;

  @Column({ name: 'Specialization', type: 'nvarchar', length: 100 })
  specialization: string;

  @Column({ name: 'ExperienceYears', type: 'int' })
  experienceYears: number;

  @Column({ name: 'ConsultationFee', type: 'decimal', precision: 10, scale: 2 })
  consultationFee: number;

  @Column({ name: 'Status', type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @Column({ name: 'IsAvailable', type: 'bit', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
