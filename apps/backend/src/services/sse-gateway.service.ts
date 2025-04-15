import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseGatewayService {
  private eventSubject = new Subject<any>();

  get events$() {
    return this.eventSubject.asObservable();
  }

  publish(data: any) {
    this.eventSubject.next({ data });
  }
}