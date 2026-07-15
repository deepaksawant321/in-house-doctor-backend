import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorAvailabilityService } from './doctor-availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('DoctorAvailability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/doctor-availability')
export class DoctorAvailabilityController {
  constructor(private readonly availabilityService: DoctorAvailabilityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new availability slot for a doctor' })
  create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(dto);
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get all availability slots for a doctor' })
  findAllByDoctor(@Param('doctorId') doctorId: string) {
    return this.availabilityService.findAllByDoctor(doctorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an availability slot' })
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
}
