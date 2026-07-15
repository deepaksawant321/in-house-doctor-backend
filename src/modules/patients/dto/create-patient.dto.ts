import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the patient' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 30, description: 'Age of the patient', required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ example: 'Male', description: 'Gender of the patient', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'O+', description: 'Blood group of the patient', required: false })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty({ example: 'Self', description: 'Relationship to the user account', required: false })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({ example: '9876543210', description: 'Mobile number', required: false })
  @IsOptional()
  @IsString()
  mobileNo?: string;

  @ApiProperty({ example: '9876543211', description: 'Emergency contact number', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ example: 'Allergic to peanuts', description: 'Medical notes', required: false })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

}
