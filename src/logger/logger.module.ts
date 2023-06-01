import { Module } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';

import { utilities } from 'nest-winston';
import * as winston from 'winston';
import { Console } from 'winston/lib/winston/transports';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { ConfigModule } from '@/config/config.module';

import { ConfigService } from '../config/config.service';

function createDailyRotateTransport(level: string, filename: string) {
  return new DailyRotateFile({
    level,
    dirname: 'logs',
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.simple(),
    ),
  });
}

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const consoleTransports = new Console({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike(),
          ),
        });

        return {
          transports: [
            consoleTransports,
            ...(configService.logOn
              ? [
                  createDailyRotateTransport('info', 'application'),
                  createDailyRotateTransport('warn', 'warn'),
                ]
              : []),
          ],
        } as WinstonModuleOptions;
      },
    }),
  ],
})
export class LoggerModule {}
