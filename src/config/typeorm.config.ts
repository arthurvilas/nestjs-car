import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configServer: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbOptions = {
      database: this.configServer.get<string>('DB_NAME'),
    };

    switch (process.env.NODE_ENV) {
      case 'development':
        Object.assign(dbOptions, {
          type: 'sqlite',
          synchronize: false,
          autoLoadEntities: true,
        });
        break;
      case 'test':
        Object.assign(dbOptions, {
          type: 'sqlite',
          synchronize: true,
          autoLoadEntities: true,
          migrationsRun: true,
          keepConnectionAlive: true,
        });
        break;
      case 'production':
        Object.assign(dbOptions, {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          migrationsRun: true,
          ssl: {
            rejectUnauthorized: false,
          },
        });
        break;
      default:
        throw new Error('Missing DB config');
    }

    return dbOptions;
  }
}
