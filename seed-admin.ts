import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const fullHost = process.env.DB_HOST || 'DESKTOP-GKN0UQE\\SQLEXPRESS';
const dbName = process.env.DB_NAME || 'InHouseDoctorDB';

const AppDataSource = new DataSource({
  type: 'mssql',
  host: fullHost,
  database: dbName,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  driver: require('mssql/msnodesqlv8'),
  extra: {
    connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${fullHost};Database=${dbName};Trusted_Connection=yes;`,
  },
});

async function run() {
  await AppDataSource.initialize();
  console.log('DB connected');

  const adminRepo = AppDataSource.getRepository('AdminUser'); 
  
  const existingAdmin = await adminRepo.findOne({ where: { email: 'admin@inhousedoctor.com' } });
  
  if (existingAdmin) {
    console.log('Admin already exists', existingAdmin);
    const hash = await bcrypt.hash('admin123', 10);
    await adminRepo.update({ id: existingAdmin.id }, { passwordHash: hash });
    console.log('Admin password reset to admin123');
  } else {
    console.log('Creating new admin');
    const hash = await bcrypt.hash('admin123', 10);
    await adminRepo.insert({
      email: 'admin@inhousedoctor.com',
      passwordHash: hash,
      fullName: 'Super Admin',
      roleName: 'SuperAdmin',
      isActive: true,
      createdDate: new Date(),
      updatedDate: new Date()
    });
    console.log('Admin created with password admin123');
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
