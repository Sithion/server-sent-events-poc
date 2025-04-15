import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ServiceBusClient } from '@azure/service-bus';
import { SseGatewayService } from './sse-gateway.service';

@Injectable()
export class ServiceBusConsumerService implements OnModuleInit, OnModuleDestroy {
  private client!: ServiceBusClient;

  constructor(private readonly sseGateway: SseGatewayService) { }

  async onModuleInit() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;

    if (!connectionString) {
      throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING is not set');
    }
    if (!queueName) {
      throw new Error('AZURE_SERVICE_QUEUE_NAME is not set');
    }

    this.client = new ServiceBusClient(connectionString);
    const receiver = this.client.createReceiver(queueName);

    receiver.subscribe({
      processMessage: async (msg) => {
        console.log('Notification Received', msg.body);
        // ******
        // Store the message in the database or perform any other processing
        // ******
        this.sseGateway.publish(msg.body); // Sent to SSE clients
        await receiver.completeMessage(msg); // Mark the message as complete
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
