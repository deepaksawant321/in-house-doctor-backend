import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [patientCount, bookingCount, upcomingVisits, unreadNotifications] = await Promise.all([
      this.patientRepository.count({ where: { user: { id: userId } } }),
      this.bookingRepository.count({ where: { user: { id: userId } } }),
      this.bookingRepository.count({
        where: {
          user: { id: userId },
          scheduledDate: MoreThanOrEqual(today),
          status: 'Confirmed', // Or whatever statuses mean upcoming
        },
      }),
      this.notificationRepository.count({
        where: { user: { id: userId }, isRead: false },
      }),
    ]);

    return {
      patientCount,
      bookingCount,
      upcomingVisits,
      unreadNotifications,
    };
  }
}
