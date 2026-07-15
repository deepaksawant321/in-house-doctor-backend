import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'Success', description: 'Payment status: Success or Rejected' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'UPI payment confirmed.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
