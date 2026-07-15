import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Address Line 1' })
  @IsNotEmpty()
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', description: 'Address Line 2', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Downtown', description: 'Area or Locality', required: false })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({ example: 'New York', description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY', description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001', description: 'Pincode or Zipcode', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: 'Near Central Park', description: 'Landmark', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;


  @ApiProperty({ example: true, description: 'Is this the default address?', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
