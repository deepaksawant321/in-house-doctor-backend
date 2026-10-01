import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Address Line 1' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', description: 'Address Line 2', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @ApiProperty({ example: 'Downtown', description: 'Area or Locality', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  area?: string;

  @ApiProperty({ example: 'New York', description: 'City', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  city?: string;

  @ApiProperty({ example: 'NY', description: 'State', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  state?: string;

  @ApiProperty({ example: '10001', description: 'Pincode or Zipcode', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]{5}$/, { message: 'Must be a valid 6-digit Indian PIN code' })
  pincode?: string;

  @ApiProperty({ example: 'Near Central Park', description: 'Landmark', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  landmark?: string;


  @ApiProperty({ example: true, description: 'Is this the default address?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
