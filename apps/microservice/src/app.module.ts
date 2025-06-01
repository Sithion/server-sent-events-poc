import { Module } from '@nestjs/common';
import { ServiceBusConsumerService } from './services/service-bus-consumer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [ServiceBusConsumerService],
})
export class AppModule { }
