import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepo: Repository<Service>,
  ) {}

  async createService(dto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepo.create(dto);
    return this.servicesRepo.save(service);
  }

  async findAllActive(): Promise<Service[]> {
    return this.servicesRepo.find({
      where: { isActive: true },
      order: { serviceName: 'ASC' },
    });
  }

  async findAll(): Promise<Service[]> {
    return this.servicesRepo.find({
      order: { id: 'DESC' },
    });
  }

  async toggleStatus(id: number): Promise<Service> {
    const service = await this.servicesRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    service.isActive = !service.isActive;
    return this.servicesRepo.save(service);
  }

  async updateService(id: number, dto: Partial<CreateServiceDto>): Promise<Service> {
    const service = await this.servicesRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    Object.assign(service, dto);
    return this.servicesRepo.save(service);
  }

  async findBySlug(slug: string): Promise<Service> {
    const service = await this.servicesRepo.findOne({ where: { slug, isActive: true } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
