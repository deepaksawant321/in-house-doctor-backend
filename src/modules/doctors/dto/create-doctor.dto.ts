import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Rajesh Kumar' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'rajesh@inhousedoctor.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'MBBS, MD' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({ example: 'Cardiologist' })
  @IsNotEmpty()
  @IsString()
  specialization: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  experienceYears: number;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  consultationFee: number;

  @ApiPropertyOptional({ example: 'Andheri West, Mumbai' })
  @IsOptional()
  @IsString()
  coverageArea?: string;
}
