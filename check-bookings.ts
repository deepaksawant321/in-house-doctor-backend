import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkBookings() {
  const host = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'InHouseDoctorDB';
  
  const dataSource = new DataSource({
    type: 'mssql',
    host: host,
    database: dbName,
    driver: require('mssql/msnodesqlv8'),
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    extra: {
      connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${host};Database=${dbName};Trusted_Connection=yes;`,
    }
  });

  await dataSource.initialize();
  
  const bookings = await dataSource.query(`SELECT TOP 5 BookingId, UserId, PatientId, DoctorId FROM Bookings`);
  console.log('Bookings:', bookings);

  await dataSource.destroy();
}

checkBookings().catch(console.error);
