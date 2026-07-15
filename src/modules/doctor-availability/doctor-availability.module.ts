import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailabilityController } from './doctor-availability.controller';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { DoctorAvailability } from '../../entities/doctor-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorAvailability])],
  controllers: [DoctorAvailabilityController],
  providers: [DoctorAvailabilityService]
})
export class DoctorAvailabilityModule {}
