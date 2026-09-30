import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const fullHost = configService.get<string>('DB_HOST') || 'localhost';

  // Local dev: Windows-authenticated SQL Server (e.g. SQLEXPRESS) via msnodesqlv8, same as the root-level scripts.
  if (configService.get<string>('DB_TRUSTED') === 'true') {
    const database = configService.get<string>('DB_DATABASE') || configService.get<string>('DB_NAME');
    return {
      type: 'mssql',
      host: fullHost,
      database,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      driver: require('mssql/msnodesqlv8'),
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      autoLoadEntities: true, // glob-based discovery is unreliable with Windows path separators
      synchronize: false,
      options: { encrypt: false, trustServerCertificate: true },
      extra: {
        connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${fullHost};Database=${database};Trusted_Connection=yes;`,
      },
    } as TypeOrmModuleOptions;
  }

  return {
    type: 'mssql',
    host: fullHost,
    port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE') || configService.get<string>('DB_NAME'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
};
