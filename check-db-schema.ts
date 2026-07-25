import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
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
  
  const result = await dataSource.query(`
    SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Services'
  `);
  
  console.log('Services schema:');
  console.table(result);

  await dataSource.destroy();
}

checkSchema().catch(console.error);
