import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { DoctorAvailability } from '../../entities/doctor-availability.entity';

describe('DoctorAvailabilityService', () => {
  let service: DoctorAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorAvailabilityService, { provide: getRepositoryToken(DoctorAvailability), useValue: {} }],
    }).compile();

    service = module.get<DoctorAvailabilityService>(DoctorAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
