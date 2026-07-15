import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  create(@Request() req: any, @Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(req.user.id, createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients for the authenticated user' })
  findAll(@Request() req: any) {
    return this.patientsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific patient by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.patientsService.findOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific patient' })
  update(@Request() req: any, @Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(req.user.id, id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific patient' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.patientsService.remove(req.user.id, id);
  }
}
