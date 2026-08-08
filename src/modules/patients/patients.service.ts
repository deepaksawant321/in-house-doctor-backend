import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { User } from '../../entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { EmailService } from '../../common/email/email.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(userId: string, createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create({
      ...createPatientDto,
      user: { id: userId },
    });
    const saved = await this.patientRepository.save(patient);

    // Send "Patient Added" email to user
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user?.email) {
        await this.emailService.sendPatientAdded(
          user.email,
          saved.fullName,
          saved.relationship || 'Self',
        );
      }
    } catch (e) {
      // non-blocking — email failure must not affect API response
    }

    return saved;
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
    try {
      await this.patientRepository.remove(patient);
    } catch (e: any) {
      if (e.number === 547 || e.code === '23503' || (e.message && e.message.includes('FOREIGN KEY'))) {
        throw new ConflictException('Cannot delete patient with active bookings or records');
      }
      throw e;
    }
  }
}
