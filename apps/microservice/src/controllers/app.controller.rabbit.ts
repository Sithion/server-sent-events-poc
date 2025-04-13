import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppRabbitController {
  @EventPattern()
  handleMyEvent(data: any) {
    console.log('Received message from RabbitMQ:', data);
  }
}
