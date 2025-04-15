import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventSource } from 'eventsource';
import { SseGatewayService } from './sse-gateway.service';

@Injectable()
export class SseClientService implements OnModuleInit {
  private eventSourceUrl!: string;
  constructor(private sseGatewayService: SseGatewayService) {
    const eventSourceUrl = process.env.EVENT_SOURCE_URL;
    console.log('eventSourceUrl', eventSourceUrl);
    if (!eventSourceUrl) {
      throw new Error('EVENT_SOURCE_URL is not defined');
    }
    this.eventSourceUrl = eventSourceUrl;
  }
  onModuleInit() {

    const source = new EventSource(this.eventSourceUrl);

    source.onmessage = (event: { data: string; }) => {
      const data = JSON.parse(event.data);
      console.log('Notification Received', data);
      this.sseGatewayService.publish(data);
    };

    source.onerror = (err: any) => {
      console.error('Error on SSE Connection', err);
    };
  }
}