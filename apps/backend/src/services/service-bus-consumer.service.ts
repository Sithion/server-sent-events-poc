import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { SseGatewayService } from './sse-gateway.service';
import { createClient, type RedisClientType } from 'redis';

@Injectable()
export class ServiceBusConsumer implements OnModuleInit {
  private redisClient: RedisClientType;

  constructor(@Inject(SseGatewayService) private sseGatewayService: SseGatewayService) {
    const redisUrl = process.env.REDIS_URL;
    const redisKey = process.env.REDIS_KEY;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not set');
    }
    if (!redisKey) {
      throw new Error('REDIS_KEY is not set');
    }
    this.redisClient = createClient({
      url: `rediss://${redisUrl}:6380`,
      password: redisKey,
    });
  }

  async onModuleInit() {
    await this.redisClient.connect();
    console.log('Notification Consumer initialized');
    this.redisClient.subscribe('notification-topic', (message) => {
      console.log('Notification received from Redis:', message);
      this.sseGatewayService.publish(JSON.parse(message));
    });
  }
}