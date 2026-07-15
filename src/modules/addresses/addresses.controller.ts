import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  create(@Request() req: any, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the authenticated user' })
  findAll(@Request() req: any) {
    return this.addressesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.findOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific address' })
  update(@Request() req: any, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(req.user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific address' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.remove(req.user.id, id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  setDefault(@Request() req: any, @Param('id') id: string) {
    return this.addressesService.setDefault(req.user.id, id);
  }
}
