import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { UsersModule } from './modules/users/users.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DoctorsModule } from './modules/doctors/doctors.module';

import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { ServicesModule } from './modules/services/services.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AddressesModule } from './modules/addresses/addresses.module';

import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CmsModule } from './modules/cms/cms.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DoctorAvailabilityModule } from './modules/doctor-availability/doctor-availability.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT'),
          secure: config.get<string>('SMTP_SECURE') === 'true',
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
      }),
    }),
    DatabaseModule,
    AuthModule,
    OtpModule,
    UsersModule,
    BookingsModule,
    PaymentsModule,
    DoctorsModule,
    
    NotificationsModule,
    AdminModule,
    ServicesModule,
    PatientsModule,
    AddressesModule,
    
    DashboardModule,
    CmsModule,
    SettingsModule,
    AuditLogsModule,
    DoctorAvailabilityModule,
    MedicalRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
