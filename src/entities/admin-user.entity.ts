import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('AdminUsers')
export class AdminUser extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'AdminId', type: 'bigint' })
  id: string;

  @Column({ name: 'FullName', type: 'nvarchar', length: 100 })
  fullName: string;

  @Column({ name: 'MobileNo', type: 'varchar', length: 20, nullable: true })
  mobileNo: string;

  @Column({ name: 'Email', type: 'nvarchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'PasswordHash', type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'RoleName', type: 'varchar', length: 50, default: 'Admin' })
  roleName: string;

  @Column({ name: 'IsActive', type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
