import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';

@Entity('Patients')
export class Patient extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'PatientId', type: 'bigint' })
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName: string;

  @Column({ name: 'Age', type: 'int', nullable: true })
  age: number;

  @Column({ name: 'Gender', type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ name: 'BloodGroup', type: 'varchar', length: 10, nullable: true })
  bloodGroup: string;

  @Column({ name: 'Relationship', type: 'varchar', length: 50, nullable: true })
  relationship: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20, nullable: true })
  mobileNo: string;

  @Column({ name: 'EmergencyContact', type: 'varchar', length: 20, nullable: true })
  emergencyContact: string;

  @Column({ name: 'MedicalNotes', type: 'nvarchar', length: 1000, nullable: true })
  medicalNotes: string;

  @Column({ name: 'IsActive', type: 'bit', default: true })
  isActive: boolean;
  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;

}
