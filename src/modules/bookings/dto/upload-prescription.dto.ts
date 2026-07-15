import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPrescriptionDto {
  @ApiProperty({ example: '1', description: 'Booking ID this prescription belongs to' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;
}
