import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BookingsService } from './src/modules/bookings/bookings.service';
import { AddressesService } from './src/modules/addresses/addresses.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bookingsService = app.get(BookingsService);
  const addressesService = app.get(AddressesService);
  
  console.log("Fetching bookings for user ID '1'");
  const bookings = await bookingsService.findMyBookings('1');
  console.log('Bookings for 1:', bookings);

  console.log("Fetching addresses for user ID '1'");
  const addresses = await addressesService.findAll('1');
  console.log('Addresses for 1:', addresses);

  await app.close();
}
bootstrap().catch(console.error);
