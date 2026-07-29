import { IsNotEmpty, IsNumber, Min, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: 500, description: 'Amount to pay' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: '1', description: 'Booking ID' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 'UPI', description: 'Payment Method', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
