import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const fullHost = configService.get<string>('DB_HOST') || 'localhost';

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
