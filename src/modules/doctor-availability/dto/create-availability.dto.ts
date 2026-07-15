import { IsNotEmpty, IsInt, Min, Max, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({ example: 'doctor-id', description: 'The ID of the doctor' })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 1=Monday...)' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00:00', description: 'Start time' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00:00', description: 'End time' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ example: true, description: 'Is the doctor available?' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
