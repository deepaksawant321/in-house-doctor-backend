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

      // Temporary verbose logging for development/debugging, remove in production
      console.log(`Incoming Origin: ${origin}`);
      console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
      console.log(`CORS Result: Blocked`);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false,
      );
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
  setupSwagger(app);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
}
bootstrap();
