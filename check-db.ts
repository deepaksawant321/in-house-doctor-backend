import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
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
  
  const tables = await dataSource.query(`SELECT name FROM sys.tables`);
  console.log('Tables:', tables);

  const notificationColumns = await dataSource.query(`
    SELECT c.name
    FROM sys.columns c
    JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'Notifications'
  `);
  console.log('Notification columns:', notificationColumns);

  await dataSource.destroy();
}

checkDb().catch(console.error);
