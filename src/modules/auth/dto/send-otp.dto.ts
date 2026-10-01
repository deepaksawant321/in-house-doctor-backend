import { IsNotEmpty, IsString, IsEnum, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OtpChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com or +919876543210' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(254)
  identifier: string;

  @ApiProperty({ enum: OtpChannel })
  @IsNotEmpty()
  @IsEnum(OtpChannel)
  channel: OtpChannel;

  @ApiProperty({ example: 'LOGIN' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['LOGIN', 'REGISTER'])
  purpose: string;
}
