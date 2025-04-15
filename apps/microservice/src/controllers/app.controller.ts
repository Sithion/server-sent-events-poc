import { Controller, Get, Query, Sse } from '@nestjs/common';
import { filter } from 'rxjs';
import { SseGatewayService } from '../services/sse-gateway.service';

@Controller()
export class AppController {
  constructor(private readonly sseGatewayService: SseGatewayService) { }

  @Sse('notifications')
  sendEvents() {
    return this.sseGatewayService.events$;
  }
}
