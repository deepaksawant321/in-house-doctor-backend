import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../../entities/doctor.entity';
import { DoctorCoverageArea } from '../../entities/doctor-coverage-area.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(DoctorCoverageArea)
    private coverageRepo: Repository<DoctorCoverageArea>,
  ) {}

  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorRepo.create({
      name: createDoctorDto.name,
      phoneNumber: createDoctorDto.phoneNumber,
      email: createDoctorDto.email,
      qualification: createDoctorDto.qualification,
      specialization: createDoctorDto.specialization,
      experienceYears: createDoctorDto.experienceYears,
      consultationFee: createDoctorDto.consultationFee,
      status: 'Active',
      isAvailable: true,
    });

    const savedDoctor = await this.doctorRepo.save(doctor);

    // Add coverage area if provided
    if (createDoctorDto.coverageArea) {
      const coverage = this.coverageRepo.create({
        doctor: savedDoctor,
        areaName: createDoctorDto.coverageArea,
      });
      await this.coverageRepo.save(coverage);
    }

    return savedDoctor;
  }

  async updateDoctor(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    
    // Update main fields
    Object.assign(doctor, {
      ...updateDoctorDto,
      coverageArea: undefined // handle coverageArea separately
    });
    
    const savedDoctor = await this.doctorRepo.save(doctor);

    if (updateDoctorDto.coverageArea !== undefined) {
      // Find existing or create new
      let coverage = await this.coverageRepo.findOne({ where: { doctor: { id } } });
      if (coverage) {
        coverage.areaName = updateDoctorDto.coverageArea;
        await this.coverageRepo.save(coverage);
      } else if (updateDoctorDto.coverageArea) {
        coverage = this.coverageRepo.create({
          doctor: savedDoctor,
          areaName: updateDoctorDto.coverageArea,
        });
        await this.coverageRepo.save(coverage);
      }
    }

    return savedDoctor;
  }

  async findAllActive(): Promise<Doctor[]> {
    return this.doctorRepo.find({
      where: { status: 'Active' },
      order: { createdDate: 'DESC' },
    });
  }

  async findByPincode(pincode: string): Promise<Doctor[]> {
    const coverageAreas = await this.coverageRepo.find({
      where: { areaName: pincode },
      relations: { doctor: true },
    });
    return coverageAreas.map(area => area.doctor).filter(d => d.status === 'Active');
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<Doctor> {
    const doctor = await this.findOne(id);
    doctor.isAvailable = isAvailable;
    return this.doctorRepo.save(doctor);
  }
}
