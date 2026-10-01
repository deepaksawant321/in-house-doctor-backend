import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './common/swagger/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { winstonConfig } from './common/logger/winston.logger';
import { WinstonModule } from 'nest-winston';

import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Enable trusting the reverse proxy (Nginx) for express-rate-limit to work correctly
  app.set('trust proxy', 1);

  const configService = app.get(require('@nestjs/config').ConfigService);

  // Refuse to boot in production with development-only switches enabled
  if (process.env.NODE_ENV === 'production') {
    const unsafe = ['EXPOSE_DEV_OTP', 'MOCK_PAYMENT_GATEWAY'].filter((k) => configService.get(k) === 'true');
    if (configService.get('DEV_FIXED_OTP')) unsafe.push('DEV_FIXED_OTP');
    if (unsafe.length) {
      throw new Error(`Unsafe production configuration: ${unsafe.join(', ')} must not be enabled/set when NODE_ENV=production`);
    }
  }

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  const corsOriginsStr = (configService.get('CORS_ORIGINS') as string) || 'https://doctordoorstep.com,https://www.doctordoorstep.com,https://admin.doctordoorstep.com';
  const allowedOrigins = corsOriginsStr
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      // Allow server-to-server requests without Origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Not an allowed origin: omit CORS headers (browser blocks the response)
      return callback(null, false);
    },
    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10000, // limit each IP to 10000 requests per windowMs
    }),
  );

  // Stricter limits on credential / OTP endpoints to slow brute-force and OTP-flooding attacks
  const authLimitMax = parseInt(configService.get('AUTH_RATE_LIMIT_MAX') || '30', 10);
  app.use(
    ['/api/admin/login', '/api/auth/send-otp', '/api/auth/login-with-otp', '/api/auth/verify-otp', '/api/auth/register', '/api/auth/login', '/api/contact'],
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: authLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many attempts. Please try again later.' },
    }),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger Documentation
  // API docs are not exposed in production unless explicitly enabled
  if (process.env.NODE_ENV !== 'production' || configService.get('SWAGGER_ENABLED') === 'true') {
    setupSwagger(app);
  }

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
}
bootstrap();
