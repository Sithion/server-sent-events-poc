import { Controller, Query, Sse } from '@nestjs/common';
import { SseGatewayService } from '../services/sse-gateway.service';
import { filter } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly sseGatewayService: SseGatewayService) { }
  @Sse('notifications')
  sendEvents(@Query('name') name?: string, @Query('type') type?: string) {
    console.log('name', name);
    console.log('type', type);
    return this.sseGatewayService.events$.pipe(filter(event =>
      (!name || event.data?.name === name)
      && (!type || event.data?.type === type)
    ));
  }
}
