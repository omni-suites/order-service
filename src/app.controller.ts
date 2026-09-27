import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): object {
    return {
      service: 'order-service',
      status: 'healthy',
      version: '2.2.0-preview',
      message: 'Webhook + Infisical cleanup verified',
      timestamp: new Date().toISOString(),
    };
  }
}
