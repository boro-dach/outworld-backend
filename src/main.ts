import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const port = process.env.PORT ?? 5000;

  const useHttps = process.env.USE_HTTPS === 'true';

  let app;

  if (useHttps) {
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem')),
    };

    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(port);

  console.log(
    `Application is running on: ${useHttps ? 'https' : 'http'}://localhost:${port}`,
  );
}

bootstrap();
