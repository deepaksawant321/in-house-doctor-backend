import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('UserSessions')
export class UserSession {
  @PrimaryGeneratedColumn({ name: 'SessionId', type: 'bigint' })
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'DeviceType', type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @Column({ name: 'DeviceInfo', type: 'nvarchar', length: 500, nullable: true })
  deviceInfo: string;

  @Column({ name: 'IPAddress', type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ name: 'AccessToken', type: 'nvarchar', length: 'MAX', nullable: true })
  accessToken: string;

  @Column({ name: 'RefreshToken', type: 'nvarchar', length: 'MAX', nullable: true })
  refreshToken: string;

  @Column({ name: 'ExpiresAt', type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ name: 'IsActive', type: 'bit', default: true, nullable: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
