import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('SystemSettings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'SettingKey', type: 'varchar', length: 100, unique: true })
  settingKey: string;

  @Column({ name: 'SettingValue', type: 'nvarchar', length: 'MAX', nullable: true })
  settingValue: string;

  @Column({ name: 'Category', type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' })
  updatedAt: Date;
}
