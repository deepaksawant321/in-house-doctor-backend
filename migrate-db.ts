import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function migrateDb() {
  const host = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'InHouseDoctorDB';
  const user = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  
  const connectionString = user && password
    ? `Driver={ODBC Driver 17 for SQL Server};Server=${host};Database=${dbName};Uid=${user};Pwd=${password};`
    : `Driver={ODBC Driver 17 for SQL Server};Server=${host};Database=${dbName};Trusted_Connection=yes;`;
  
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
      connectionString,
    }
  });

  await dataSource.initialize();
  
  const queries = [
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'FileUrl' AND Object_ID = Object_ID(N'MedicalRecords'))
     BEGIN ALTER TABLE MedicalRecords ADD FileUrl nvarchar(1000) NULL END`,
    
    // Services table new columns
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Slug' AND Object_ID = Object_ID(N'Services'))
     BEGIN ALTER TABLE Services ADD Slug nvarchar(100) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'LongDescription' AND Object_ID = Object_ID(N'Services'))
     BEGIN ALTER TABLE Services ADD LongDescription nvarchar(MAX) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'ImageUrl' AND Object_ID = Object_ID(N'Services'))
     BEGIN ALTER TABLE Services ADD ImageUrl nvarchar(500) NULL END`,
     
    // OTPVerifications table new columns
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Email' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD Email varchar(150) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'OTPHash' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD OTPHash varchar(255) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Purpose' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD Purpose varchar(50) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Channel' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD Channel varchar(50) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'AttemptCount' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD AttemptCount int NULL DEFAULT 0 END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'VerifiedAt' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD VerifiedAt datetime NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IPAddress' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD IPAddress varchar(50) NULL END`,
     
    `IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'UserAgent' AND Object_ID = Object_ID(N'OTPVerifications'))
     BEGIN ALTER TABLE OTPVerifications ADD UserAgent varchar(255) NULL END`
  ];

  for (const q of queries) {
    try {
      await dataSource.query(q);
    } catch (err) {
      console.error('Error executing query:', q, err);
    }
  }
  
  console.log('Database schema migrations applied successfully.');

  await dataSource.destroy();
}

migrateDb().catch(console.error);
