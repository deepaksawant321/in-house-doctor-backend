import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Patient } from '../../entities/patient.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Booking, Notification])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
