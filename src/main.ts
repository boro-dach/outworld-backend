import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: fs.readFileSync('./src/certificates/cloudflare.key'),
      cert: fs.readFileSync('./src/certificates/cloudflare.pem')
    }
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  });

  await app.listen(process.env.PORT ?? 443);
}
bootstrap();
