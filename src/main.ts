import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
    })
  )

  app.enableCors({
    origin: '*', // o algún dominio específico
    methods: 'GET,POST,PATCH,DELETE',
  });

  await app.listen(process.env.PORT ?? 3000);
  logger.log("Everything is already");
}
bootstrap();
