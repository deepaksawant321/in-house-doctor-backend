import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('Users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'UserId', type: 'bigint' })
  id: string;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ name: 'IsVerified', type: 'bit', default: false })
  isVerified: boolean;

  @Column({ name: 'Status', type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
