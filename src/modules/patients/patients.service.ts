import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(userId: string, createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create({
      ...createPatientDto,
      user: { id: userId },
    });
    return this.patientRepository.save(patient);
  }

  async findAll(userId: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { user: { id: userId } },
      order: { createdDate: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`);
    }
    return patient;
  }

  async update(userId: string, id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(userId, id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(userId: string, id: string): Promise<void> {
    const patient = await this.findOne(userId, id);
    await this.patientRepository.remove(patient);
  }
}
