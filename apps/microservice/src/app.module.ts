import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppRabbitController } from './controllers/app.controller.rabbit';

@Module({
  imports: [],
  controllers: [AppController, AppRabbitController],
  providers: [],
})
export class AppModule { }
