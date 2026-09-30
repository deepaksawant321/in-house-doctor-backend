import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { isAdminUser } from '../../common/utils/roles';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { Booking } from '../../entities/booking.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Creates and stores a notification record.
   * In production, this would integrate with an SMS/email/push provider.
   */
  async sendNotification(params: {
    booking?: Booking;
    recipient: string; // Keep for backward compatibility or direct phone numbers
    notificationType: string;
    message: string;
    userId?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepo.create({
      booking: params.booking,
      user: params.userId ? { id: params.userId } as any : null,
      recipient: params.recipient,
      notificationType: params.notificationType,
      message: params.message,
      deliveryStatus: 'Sent',
      isRead: false,
    });

    const saved = await this.notificationRepo.save(notification);

    // In production: call SMS/email API here (e.g. Twilio, MSG91, SendGrid)
    this.logger.log(
      `[DEV Notification] Type: ${params.notificationType} | To: ${params.recipient} | Msg: ${params.message}`,
    );

    return saved;
  }

  async getNotificationsForBooking(user: { id: string; role?: string }, bookingId: string): Promise<Notification[]> {
    if (!/^\d{1,18}$/.test(String(bookingId))) throw new BadRequestException('Invalid booking id');
    const booking = await this.notificationRepo.manager.findOne(Booking, { where: { id: bookingId }, relations: { user: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!isAdminUser(user) && booking.user?.id !== user.id) throw new ForbiddenException('You do not have access to this booking');
    return this.notificationRepo.find({
      where: { booking: { id: bookingId } },
      order: { sentDate: 'DESC' },
    });
  }

  async getMyNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: [
        { user: { id: userId } },
        { recipient: userId } // fallback if recipient ID holds the user ID or patient ID
      ],
      order: { sentDate: 'DESC' },
    });
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    await this.notificationRepo.update(
      { id, user: { id: userId } },
      { isRead: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationRepo.find({
      relations: { booking: true },
      order: { sentDate: 'DESC' },
    });
  }
}
