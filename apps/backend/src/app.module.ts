import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { SseClientService } from './services/sse-client.service';
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
  providers: [SseClientService, SseGatewayService],
})
export class AppModule { }
