import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const fullHost = configService.get<string>('DB_HOST') || 'localhost';

  return {
    type: 'mssql',
    host: fullHost, // Pass DESKTOP-GKN0UQE\SQLEXPRESS directly!
    database: configService.get<string>('DB_NAME'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    driver: require('mssql/msnodesqlv8'),
    extra: {
      connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${fullHost};Database=${configService.get<string>('DB_NAME')};Trusted_Connection=yes;`,
    },
  };
};
