import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'InHouseDoctorDB',
  synchronize: false, // CRITICAL: Database already exists, do not modify schema
  autoLoadEntities: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}));
