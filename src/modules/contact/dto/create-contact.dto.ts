import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateContactDto {
  @ApiProperty({ example: 'Asha Patil' })
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @Transform(trim)
  @IsOptional()
  @Matches(/^\+?[0-9 -]{8,15}$/, { message: 'Enter a valid mobile number' })
  mobile?: string;

  @ApiPropertyOptional({ example: 'asha@example.com' })
  @Transform(trim)
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ example: 'I would like to know more about elder care visits.' })
  @Transform(trim)
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
