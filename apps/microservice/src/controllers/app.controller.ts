import { Controller, Res, Sse } from '@nestjs/common';
import { SseGatewayService } from '../services/sse-gateway.service';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor(private readonly sseGatewayService: SseGatewayService) { }

  @Sse('notifications')
  sendEvents(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    return this.sseGatewayService.events$;
  }
}
