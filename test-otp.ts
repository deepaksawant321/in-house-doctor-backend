import { DataSource } from 'typeorm';
import { OTPVerification } from './src/entities/otp-verification.entity';

const AppDataSource = new DataSource({
  type: 'mssql',
  host: 'DESKTOP-GKN0UQE\\SQLEXPRESS',
  database: 'InHouseDoctorDB',
  synchronize: false,
  logging: true,
  entities: [OTPVerification],
  driver: require('mssql/msnodesqlv8'),
  extra: {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-GKN0UQE\\SQLEXPRESS;Database=InHouseDoctorDB;Trusted_Connection=yes;'
  }
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to DB');
    const otp = AppDataSource.getRepository(OTPVerification).create({
        phoneNumber: '+919987866321',
        otpCode: '1234',
        expiresAt: new Date()
    });
    await AppDataSource.getRepository(OTPVerification).save(otp);
    console.log('Saved OTP!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
