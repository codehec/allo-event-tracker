import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Web3Service } from './web3/web3.service';
import { blockchainConfigs } from './config/blockchain.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Allo Event Tracker Service')
    .setDescription('API for tracking blockchain events and analytics')
    .setVersion('1.0')
    .addTag('web3', 'Blockchain event tracking and management')
    .addTag('tracking', 'Event analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  const web3Service = app.get(Web3Service);
  await web3Service.connectToMultipleChains(blockchainConfigs);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
