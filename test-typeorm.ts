import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'mssql',
  host: 'DESKTOP-GKN0UQE\\SQLEXPRESS',
  database: 'InHouseDoctorDB',
  synchronize: false,
  logging: true,
  entities: [User],
  driver: require('mssql/msnodesqlv8'),
  extra: {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-GKN0UQE\\SQLEXPRESS;Database=InHouseDoctorDB;Trusted_Connection=yes;'
  }
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to DB');
    const user = await AppDataSource.getRepository(User).findOne({ where: { phoneNumber: '+919987866321' } });
    console.log('Found user:', user);
    if (!user) {
      const newUser = AppDataSource.getRepository(User).create({
        fullName: 'Test User',
        email: 'test@example.com',
        phoneNumber: '+919987866321',
        isVerified: false,
        status: 'Active'
      });
      await AppDataSource.getRepository(User).save(newUser);
      console.log('Saved user!');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
