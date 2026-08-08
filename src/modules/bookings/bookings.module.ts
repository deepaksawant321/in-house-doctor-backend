import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from '../../entities/booking.entity';
import { BookingStatusHistory } from '../../entities/booking-status-history.entity';
import { Prescription } from '../../entities/prescription.entity';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingStatusHistory, Prescription, Notification, User]),
    MulterModule.register({ dest: './uploads/prescriptions' }),
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
