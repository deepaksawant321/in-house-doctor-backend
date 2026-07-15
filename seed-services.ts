import { DataSource } from 'typeorm';

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

  const servicesRepo = AppDataSource.getRepository('Service'); 

  const servicesToSeed = [
    { serviceName: 'General Physician', slug: 'general-physician', description: 'Expert medical consultation at your doorstep.', isActive: true, basePrice: 500 },
    { serviceName: 'Nursing Care', slug: 'nursing-care', description: 'Professional nursing care for your loved ones.', isActive: true, basePrice: 800 },
    { serviceName: 'Physiotherapy', slug: 'physiotherapy', description: 'Expert physiotherapy sessions at home.', isActive: true, basePrice: 600 },
    { serviceName: 'Elder Care', slug: 'elder-care', description: 'Compassionate elder care services.', isActive: true, basePrice: 1000 },
  ];

  for (const s of servicesToSeed) {
    const existing = await servicesRepo.findOne({ where: { slug: s.slug } });
    if (!existing) {
      console.log(`Creating service: ${s.serviceName}`);
      await servicesRepo.insert(s);
    } else {
      console.log(`Service already exists: ${s.serviceName}`);
    }
  }

  console.log('Finished seeding services.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
