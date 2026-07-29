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
  // Note: MinDate requires a Date object, IsDateString is a string, so we need a custom validator or just let service validate it. Let's add a custom validator decorator or simply validate in service since DTO transforms strings differently. Actually, a simpler approach is to check it in service to avoid complex custom class-validators for strings. But wait, class-validator has IsFutureDate? No. 
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
