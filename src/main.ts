import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { ExceptionFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // 去除在类上不存在的字段
      // whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(
    new ExceptionFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );
  await app.listen(4000);
}
bootstrap();
