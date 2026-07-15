import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDoctorDto {
  @ApiProperty({ example: '1', description: 'Booking ID to assign doctor to' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: '3', description: 'Doctor ID to assign' })
  @IsNotEmpty()
  @IsString()
  doctorId: string;
}
