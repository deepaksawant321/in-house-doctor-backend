import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  getHealth() {
    return {
      status: "Healthy",
      database: "Connected",
      serverTime: new Date().toISOString()
    };
  }
}
