import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminUser } from '../../entities/admin-user.entity';
import { User } from '../../entities/user.entity';
import { Doctor } from '../../entities/doctor.entity';
import { Booking } from '../../entities/booking.entity';
import { Payment } from '../../entities/payment.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Setting } from '../../entities/setting.entity';
import { DoctorAssignment } from '../../entities/doctor-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, User, Doctor, Booking, Payment, AuditLog, Setting, DoctorAssignment]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'inhousedoctor_secret_key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
