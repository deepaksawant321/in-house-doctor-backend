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
import { EmailModule } from './common/email/email.module';
import { ContactModule } from './modules/contact/contact.module';
import { FilesModule } from './modules/files/files.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // Only non-sensitive site assets (e.g. the UPI QR image) are public. Prescriptions, payment proofs and
      // medical records are private and served via the authenticated GET /api/files/:folder/:name endpoint.
      rootPath: join(process.cwd(), 'uploads', 'settings'),
      serveRoot: '/uploads/settings',
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
          // MAIL_FROM may already be a full "Name <address>"; only wrap a bare address
          from: (() => {
            const from = config.get<string>('MAIL_FROM') || config.get<string>('SMTP_USER') || '';
            return from.includes('<') ? from : `"Doctor Doorstep" <${from}>`;
          })(),
          // Replies to the do-not-reply sender land with the support team
          replyTo: config.get<string>('MAIL_REPLY_TO') || undefined,
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
    EmailModule,
    ContactModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
