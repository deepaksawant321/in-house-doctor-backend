import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability } from '../../entities/doctor-availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,
  ) {}

  async create(dto: CreateAvailabilityDto): Promise<DoctorAvailability> {
    const availability = this.availabilityRepo.create({
      doctor: { id: dto.doctorId } as any,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isAvailable: dto.isAvailable ?? true,
    });
    return this.availabilityRepo.save(availability);
  }

  async findAllByDoctor(doctorId: string): Promise<DoctorAvailability[]> {
    return this.availabilityRepo.find({
      where: { doctor: { id: doctorId } },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    const record = await this.availabilityRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Availability record not found');
    await this.availabilityRepo.remove(record);
  }
}
