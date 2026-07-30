import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', // user dashboard
      'http://localhost:3002', // admin dashboard
    ],
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
}
bootstrap();
