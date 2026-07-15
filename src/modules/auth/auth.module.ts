import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { OtpModule } from '../otp/otp.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSession } from '../../entities/user-session.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';

@Module({
  imports: [
    UsersModule,
    OtpModule,
    PassportModule,
    TypeOrmModule.forFeature([UserSession, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d' as any },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
