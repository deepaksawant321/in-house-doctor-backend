import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {


  @ApiProperty({ example: 'uuid-of-patient' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({ example: '2026-06-10T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'Fever and cold for 2 days' })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional({ example: 1, description: 'Service ID for the booking' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({ example: 'uuid-of-address', description: 'Address ID for the booking' })
  @IsOptional()
  @IsString()
  addressId?: string;
}
