import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Doctor } from './doctor.entity';

@Entity('DoctorCoverageAreas')
export class DoctorCoverageArea extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'CoverageId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'DoctorId' })
  doctor: Doctor;

  @Column({ name: 'AreaName', type: 'nvarchar', length: 100 })
  areaName: string; // Map AreaName here. Pincode and City don't exist in the actual DB schema.
}
