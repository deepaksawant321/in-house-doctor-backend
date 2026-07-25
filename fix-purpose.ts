import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function fixPurpose() {
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
  
  try {
    await dataSource.query(`
      IF NOT EXISTS (SELECT * FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('OTPVerifications') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('OTPVerifications'), 'Purpose', 'ColumnId'))
      BEGIN
        ALTER TABLE OTPVerifications ADD CONSTRAINT DF_OTPVerifications_Purpose DEFAULT 'LOGIN' FOR Purpose;
      END
    `);
    console.log('Successfully added DEFAULT constraint to Purpose column.');
  } catch (error) {
    console.error('Failed to add constraint:', error);
  }

  await dataSource.destroy();
}

fixPurpose().catch(console.error);
