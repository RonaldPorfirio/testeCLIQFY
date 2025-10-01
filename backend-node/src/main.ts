import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Usa o logger pino em toda a aplicação
  app.useLogger(app.get(Logger));

  // Habilita CORS para o front-end (Next.js)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Prefixo global para APIs
  app.setGlobalPrefix('api');
  // Ouça na porta 5000 para não conflitar com Next (3000)
  await app.listen(5000);
}
bootstrap();
