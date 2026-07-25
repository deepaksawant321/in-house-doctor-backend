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
  
  const corsOrigin = configService.get('CORS_ORIGIN');
  const allowedOrigins = corsOrigin ? corsOrigin.split(',') : ['http://localhost:3000'];
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
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
