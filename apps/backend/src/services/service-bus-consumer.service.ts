import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { SseGatewayService } from './sse-gateway.service';
import { ServiceBusAdministrationClient, ServiceBusClient, type ServiceBusReceiver } from '@azure/service-bus';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class ServiceBusConsumer implements OnModuleInit, OnModuleDestroy {
  private client: ServiceBusClient;
  private readonly connectionString: string;
  private readonly topicName: string;
  private readonly subscriptionName: string;

  constructor(@Inject(SseGatewayService) private sseGatewayService: SseGatewayService) {
    if (!process.env.AZURE_SERVICE_BUS_CONNECTION_STRING) {
      throw new Error('AZURE_SERVICE_BUS_CONNECTION_STRING is not set');
    }
    if (!process.env.AZURE_SERVICE_BUS_TOPIC_NAME) {
      throw new Error('AZURE_SERVICE_BUS_TOPIC_NAME is not set');
    }
    if (!process.env.AZURE_SERVICE_BUS_TOPIC_SUBSCRIPTION_NAME_PREFIX) {
      throw new Error('AZURE_SERVICE_BUS_TOPIC_SUBSCRIPTION_NAME_PREFIX is not set');
    }
    this.connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
    this.topicName = process.env.AZURE_SERVICE_BUS_TOPIC_NAME;
    this.subscriptionName = `${process.env.AZURE_SERVICE_BUS_TOPIC_SUBSCRIPTION_NAME_PREFIX}-${uuidv4()}`;
    this.client = new ServiceBusClient(this.connectionString);
  }

  async createSubscription() {
    const adminClient = new ServiceBusAdministrationClient(this.connectionString);
    const exists = await adminClient.subscriptionExists(this.topicName, this.subscriptionName);
    if (!exists) {
      await adminClient.createSubscription(this.topicName, this.subscriptionName);
      console.log(`Subscription '${this.subscriptionName}' created.`);
    }
    const deleteSubscription = async () => {
      await adminClient.deleteSubscription(this.topicName, this.subscriptionName);
      process.exit(0);
    };
    process.on("SIGINT", deleteSubscription);
    process.on("SIGTERM", deleteSubscription);
  }

  async onModuleInit() {
    await this.createSubscription();
    const topicReceiver = this.client.createReceiver(this.topicName, this.subscriptionName, {
      receiveMode: "receiveAndDelete"
    });
    topicReceiver.subscribe({
      processMessage: async (msg) => {
        console.log('Notification Received', msg.body);
        this.sseGatewayService.publish(msg.body);
      },
      processError: async (err) => {
        console.error("Notification Error:", err);
      },
    });
  }
  async onModuleDestroy() {
    await this.client.close();
    console.log('Notification Consumer closed');
  }
}