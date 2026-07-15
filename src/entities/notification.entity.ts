import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity('Notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'NotificationId', type: 'bigint' })
  id: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'BookingId' })
  booking: Booking;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'NotificationType', type: 'varchar', length: 50 })
  notificationType: string;

  @Column({ name: 'Recipient', type: 'varchar', length: 100 })
  recipient: string;

  @Column({ name: 'Message', type: 'nvarchar', length: 'MAX' })
  message: string;

  @Column({ name: 'DeliveryStatus', type: 'varchar', length: 50, default: 'Pending' })
  deliveryStatus: string;

  @Column({ name: 'IsRead', type: 'bit', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'SentDate' })
  sentDate: Date;
}
