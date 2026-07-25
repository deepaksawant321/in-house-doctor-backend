import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com or +1234567890' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ example: 'LOGIN' })
  @IsNotEmpty()
  @IsString()
  purpose: string;
}
