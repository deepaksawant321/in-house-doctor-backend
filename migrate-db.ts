import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrateDb() {
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
  
  const queries = [
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'FileUrl' AND Object_ID = Object_ID(N'MedicalRecords'))
     BEGIN ALTER TABLE MedicalRecords ADD FileUrl nvarchar(1000) NULL END`
  ];

  for (const q of queries) {
    await dataSource.query(q);
  }
  
  console.log('FileUrl added to MedicalRecords.');

  await dataSource.destroy();
}

migrateDb().catch(console.error);
