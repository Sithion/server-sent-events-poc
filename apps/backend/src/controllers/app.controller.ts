import { Controller, Inject, Query, Res, Sse } from '@nestjs/common';
import { SseGatewayService } from '../services/sse-gateway.service';
import { filter } from 'rxjs';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    @Inject(SseGatewayService) private readonly sseGatewayService: SseGatewayService) { }
  @Sse('notifications')
  sendEvents(@Res() res: Response, @Query('name') name?: string, @Query('type') type?: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return this.sseGatewayService.events$.pipe(filter(event =>
      (!name || event.data?.name === name)
      && (!type || event.data?.type === type)
    ));
  }
}
