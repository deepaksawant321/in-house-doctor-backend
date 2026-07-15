import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Services')
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active services (Public/Patients)' })
  async findAllActive() {
    return {
      success: true,
      data: await this.servicesService.findAllActive(),
    };
  }

  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all services including inactive (Admin)' })
  async findAll() {
    return {
      success: true,
      data: await this.servicesService.findAll(),
    };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new medical service (Admin)' })
  async create(@Body() createServiceDto: CreateServiceDto) {
    return {
      success: true,
      message: 'Service created successfully',
      data: await this.servicesService.createService(createServiceDto),
    };
  }

  @Patch(':id/toggle-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle service active/inactive status (Admin)' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return {
      success: true,
      message: 'Service status updated',
      data: await this.servicesService.toggleStatus(id),
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a medical service (Admin)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateServiceDto: Partial<CreateServiceDto>) {
    return {
      success: true,
      message: 'Service updated successfully',
      data: await this.servicesService.updateService(id, updateServiceDto),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a service by slug (Public)' })
  async findBySlug(@Param('slug') slug: string) {
    return {
      success: true,
      data: await this.servicesService.findBySlug(slug),
    };
  }
}
