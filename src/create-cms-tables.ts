import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Connected to database. Running migrations...');

  try {
    await dataSource.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='faqs' AND xtype='U')
      CREATE TABLE faqs (
          id int IDENTITY(1,1) PRIMARY KEY,
          question nvarchar(MAX) NOT NULL,
          answer nvarchar(MAX) NOT NULL,
          isActive bit NOT NULL DEFAULT 1,
          createdDate datetime2 NOT NULL DEFAULT getdate()
      )
    `);
    console.log('Table faqs created or already exists.');

    await dataSource.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='testimonials' AND xtype='U')
      CREATE TABLE testimonials (
          id int IDENTITY(1,1) PRIMARY KEY,
          name nvarchar(255) NOT NULL,
          role nvarchar(255) NOT NULL,
          quote nvarchar(MAX) NOT NULL,
          rating float NOT NULL DEFAULT 5.0,
          isActive bit NOT NULL DEFAULT 1,
          createdDate datetime2 NOT NULL DEFAULT getdate()
      )
    `);
    console.log('Table testimonials created or already exists.');

  } catch (err) {
    console.error('Error running migrations:', err);
  }

  await app.close();
}

bootstrap();
