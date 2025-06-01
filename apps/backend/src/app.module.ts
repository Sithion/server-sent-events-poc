import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { ServiceBusConsumer } from './services/service-bus-consumer.service';
import { SseGatewayService } from './services/sse-gateway.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [ServiceBusConsumer, SseGatewayService],
})
export class AppModule { }
