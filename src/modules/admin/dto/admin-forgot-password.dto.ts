import { IsEmail, IsNotEmpty, IsString, Length, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminForgotPasswordDto {
  @ApiProperty({ example: 'admin@inhousedoctor.com' })
  @IsEmail()
  email: string;
}

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'admin@inhousedoctor.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NewStrongPass@123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
