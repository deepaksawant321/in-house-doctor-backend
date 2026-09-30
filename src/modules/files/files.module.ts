import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { Payment } from '../../entities/payment.entity';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { Prescription } from '../../entities/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, MedicalRecord, Prescription])],
  controllers: [FilesController],
})
export class FilesModule {}
