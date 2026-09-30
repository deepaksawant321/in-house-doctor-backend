import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Patient } from '../../entities/patient.entity';
import { Booking } from '../../entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { UploadRecordDto } from './dto/upload-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private recordRepository: Repository<MedicalRecord>,
  ) {}

  async uploadRecord(userId: string, file: Express.Multer.File, uploadRecordDto: UploadRecordDto): Promise<MedicalRecord> {
    if (!file) throw new BadRequestException('A file is required');

    // The patient (and booking, if given) must belong to the authenticated user
    const patient = await this.recordRepository.manager.findOne(Patient, {
      where: { id: uploadRecordDto.patientId, user: { id: userId } } as any,
    });
    if (!patient) throw new NotFoundException('Patient not found');
    if (uploadRecordDto.bookingId) {
      const booking = await this.recordRepository.manager.findOne(Booking, {
        where: { id: uploadRecordDto.bookingId, user: { id: userId } } as any,
      });
      if (!booking) throw new NotFoundException('Booking not found');
    }
    const record = this.recordRepository.create({
      patient: { id: uploadRecordDto.patientId } as any,
      doctor: uploadRecordDto.doctorId ? { id: uploadRecordDto.doctorId } as any : null,
      booking: uploadRecordDto.bookingId ? { id: uploadRecordDto.bookingId } as any : null,
      fileUrl: `/uploads/MedicalRecords/${file.filename}`,
      fileName: file.originalname,
      description: uploadRecordDto.description,
      recordType: uploadRecordDto.recordType,
    });
    return this.recordRepository.save(record);
  }

  async findAll(userId: string): Promise<MedicalRecord[]> {
    return this.recordRepository.find({
      where: { patient: { user: { id: userId } } },
      relations: { patient: true, doctor: true, booking: true },
      order: { createdDate: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<MedicalRecord> {
    const record = await this.recordRepository.findOne({
      where: { id, patient: { user: { id: userId } } },
      relations: { patient: true, doctor: true, booking: true },
    });
    if (!record) {
      throw new NotFoundException(`Medical Record with ID "${id}" not found`);
    }
    return record;
  }

  async remove(userId: string, id: string): Promise<void> {
    const record = await this.findOne(userId, id);
    // Optionally delete the file from the filesystem here using fs.unlink
    await this.recordRepository.remove(record);
  }
}
