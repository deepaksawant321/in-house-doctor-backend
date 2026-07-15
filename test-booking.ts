import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BookingsService } from './src/modules/bookings/bookings.service';
import { CreateBookingDto } from './src/modules/bookings/dto/create-booking.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingsService = app.get(BookingsService);

  const dto: CreateBookingDto = {
    
    patientId: '1',
    scheduledDate: '2026-06-10T17:09:55.837Z',
    symptoms: 'dfsdf dsfdsfdsf'
  };

  try {
    const booking = await bookingsService.createBooking('1', dto);
    console.log('Booking created successfully', booking);
  } catch (error) {
    console.error('Error creating booking:');
    console.error(error);
  }

  await app.close();
}

bootstrap();
