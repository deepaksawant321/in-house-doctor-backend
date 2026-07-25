import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ServicesService } from './src/modules/services/services.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const servicesService = app.get(ServicesService);
  
  try {
    console.log("Fetching active services...");
    const services = await servicesService.findAllActive();
    console.log('Services:', services);
  } catch (error) {
    console.error('Error fetching services:', error);
  }

  await app.close();
}
bootstrap().catch(console.error);
