import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumberString } from 'class-validator';

export class UploadRecordDto {
  @ApiProperty({ example: '1', description: 'Patient ID' })
  @IsNotEmpty()
  @IsNumberString()
  patientId: string;

  @ApiProperty({ example: '1', description: 'Doctor ID', required: false })
  @IsOptional()
  @IsNumberString()
  doctorId?: string;

  @ApiProperty({ example: '1', description: 'Booking ID', required: false })
  @IsOptional()
  @IsNumberString()
  bookingId?: string;

  @ApiProperty({ example: 'Blood Test Report', description: 'Description of the record', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Report', description: 'Type of record (Report, Prescription, etc.)', required: false })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'The file to upload' })
  file: any;
}
