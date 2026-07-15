import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookingStatusDto {
  @ApiProperty({ example: 'Confirmed', description: 'New booking status' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'Doctor assigned and confirmed.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
