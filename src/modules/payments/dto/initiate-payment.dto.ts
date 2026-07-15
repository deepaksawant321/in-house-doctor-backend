import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'uuid-of-booking' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Online', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
