import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Connected to database. Altering Settings table...');

  try {
    // Add columns one by one in SQL Server
    const columns = [
      'companyName nvarchar(255) NULL',
      'supportEmail nvarchar(255) NULL',
      'supportPhone nvarchar(255) NULL',
      'whatsappNumber nvarchar(255) NULL',
      'primaryUpiId nvarchar(255) NULL',
      'qrCodeImage nvarchar(MAX) NULL'
    ];
    
    for (const col of columns) {
      try {
        await dataSource.query(`ALTER TABLE Settings ADD ${col}`);
        console.log(`Added column ${col}`);
      } catch (e: any) {
        console.log(`Column ${col} might already exist or error:`, e.message);
      }
    }
    
    console.log('Table Settings altered successfully.');
  } catch (err) {
    console.error('Error altering Settings table:', err);
  }

  await app.close();
}

bootstrap();
