import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './common/swagger/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { winstonConfig } from './common/logger/winston.logger';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Security
  app.use(helmet());
  app.enableCors();
  
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

  const configService = app.get(require('@nestjs/config').ConfigService);
  const port = configService.get('PORT') || 3001;
  await app.listen(port);
}
bootstrap();
