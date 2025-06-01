import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy
} from '@nestjs/common';
import {
  ServiceBusClient,
  type ServiceBusSender,
  type ServiceBusReceiver
} from '@azure/service-bus';
import { createClient, type RedisClientType } from 'redis';



@Injectable()
export class ServiceBusConsumerService implements OnModuleInit, OnModuleDestroy {
  private client!: ServiceBusClient;
  private queueReceiver: ServiceBusReceiver;
  private redisClient: RedisClientType;

  constructor() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
    const redisUrl = process.env.REDIS_URL;
    const redisKey = process.env.REDIS_KEY;
    if (!connectionString) {
      throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING is not set');
    }
    if (!queueName) {
      throw new Error('AZURE_SERVICE_QUEUE_NAME is not set');
    }
    if (!redisUrl) {
      throw new Error('REDIS_URL is not set');
    }
    if (!redisKey) {
      throw new Error('REDIS_KEY is not set');
    }

    this.client = new ServiceBusClient(connectionString);
    this.queueReceiver = this.client.createReceiver(queueName);
    // this.topicSender = this.client.createSender(topicName);
    this.redisClient = createClient({
      url: `rediss://${redisUrl}:6380`,
      password: redisKey,
    });
  }

  async onModuleInit() {
    this.queueReceiver.subscribe({
      processMessage: async (msg) => {
        console.log('Notification Received', msg.body);
        // ******
        // Store the message in the database or perform any other processing
        // ******        
        await this.queueReceiver.completeMessage(msg); // Mark the message as complete
        if (!this.redisClient.isReady) {
          await this.redisClient.connect();
        }
        await this.redisClient.publish('notification-topic', JSON.stringify(msg.body)); // Sent to redis topic
        await this.redisClient.quit(); // Close the redis connection
      },
      processError: async (err) => {
        console.error('Notification error:', err);
      },
    });

    console.log('Notification Consumer connected to Service Bus');
  }

  async onModuleDestroy() {
    await this.client.close();
    console.log('Notification Consumer closed');
  }
}
