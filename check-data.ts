import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkData() {
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
  
  const users = await dataSource.query(`SELECT UserId, FullName, Email, MobileNo FROM Users`);
  console.log('Users:', users);

  const bookings = await dataSource.query(`SELECT BookingId, UserId, PatientId FROM Bookings`);
  console.log('Bookings:', bookings);

  await dataSource.destroy();
}

checkData().catch(console.error);
