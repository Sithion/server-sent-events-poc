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



@Injectable()
export class ServiceBusConsumerService implements OnModuleInit, OnModuleDestroy {
  private client!: ServiceBusClient;
  private queueReceiver: ServiceBusReceiver;
  private topicSender: ServiceBusSender;

  constructor() {
    const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
    const topicName = process.env.AZURE_SERVICE_BUS_TOPIC_NAME;
    if (!connectionString) {
      throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING is not set');
    }
    if (!queueName) {
      throw new Error('AZURE_SERVICE_QUEUE_NAME is not set');
    }
    if (!topicName) {
      throw new Error('AZURE_SERVICE_BUS_TOPIC_NAME is not set');
    }

    this.client = new ServiceBusClient(connectionString);
    this.queueReceiver = this.client.createReceiver(queueName);
    this.topicSender = this.client.createSender(topicName);
  }

  async onModuleInit() {
    this.queueReceiver.subscribe({
      processMessage: async (msg) => {
        console.log('Notification Received', msg.body);
        // ******
        // Store the message in the database or perform any other processing
        // ******        
        await this.queueReceiver.completeMessage(msg); // Mark the message as complete
        this.topicSender.sendMessages(msg); // Sent to azure service bus topic
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
