import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Doctors')
@Controller('api/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new doctor profile (Admin)' })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return {
      success: true,
      data: await this.doctorsService.createDoctor(createDoctorDto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all active doctors or filter by area/pincode' })
  async findAll(@Query('pincode') pincode?: string) {
    const doctors = pincode
      ? await this.doctorsService.findByPincode(pincode)
      : await this.doctorsService.findAllActive();
    return { success: true, data: doctors };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor profile by ID' })
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.doctorsService.findOne(id),
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update doctor profile (Admin)' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return {
      success: true,
      data: await this.doctorsService.updateDoctor(id, updateDoctorDto),
    };
  }

  @Patch(':id/availability')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle doctor availability (true/false)' })
  async updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return {
      success: true,
      data: await this.doctorsService.updateAvailability(id, isAvailable),
    };
  }
}
