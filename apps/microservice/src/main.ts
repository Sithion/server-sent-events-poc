import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'notification_queue',
      queueOptions: {
        durable: false
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();

