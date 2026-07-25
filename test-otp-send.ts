import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/modules/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  
  try {
    console.log("Sending OTP...");
    const result = await authService.sendOtpLogin({
      identifier: 'deepaksawant321@gmail.com',
      channel: 'EMAIL',
      purpose: 'LOGIN'
    } as any);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error sending OTP:', error);
  }

  await app.close();
}
bootstrap().catch(console.error);
