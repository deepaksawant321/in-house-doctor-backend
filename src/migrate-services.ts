import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Running Services table migration...');

  try {
    // Add columns if they don't exist
    await dataSource.query(`
      IF COL_LENGTH('Services', 'Slug') IS NULL
      BEGIN
          ALTER TABLE Services ADD Slug nvarchar(100) NULL;
          PRINT 'Added Slug column';
      END
    `);

    await dataSource.query(`
      IF COL_LENGTH('Services', 'LongDescription') IS NULL
      BEGIN
          ALTER TABLE Services ADD LongDescription nvarchar(MAX) NULL;
          PRINT 'Added LongDescription column';
      END
    `);

    await dataSource.query(`
      IF COL_LENGTH('Services', 'ImageUrl') IS NULL
      BEGIN
          ALTER TABLE Services ADD ImageUrl nvarchar(500) NULL;
          PRINT 'Added ImageUrl column';
      END
    `);

    // Insert or update default services to have slugs so the frontend routing doesn't break
    await dataSource.query(`
      UPDATE Services SET Slug = 'general-physician' WHERE ServiceName = 'General Physician';
      UPDATE Services SET Slug = 'nursing-care' WHERE ServiceName = 'Nursing Care';
      UPDATE Services SET Slug = 'physiotherapy' WHERE ServiceName = 'Physiotherapy';
      UPDATE Services SET Slug = 'elder-care' WHERE ServiceName = 'Elder Care';
    `);

    console.log('Services table migrated successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
  }

  await app.close();
}

bootstrap();
