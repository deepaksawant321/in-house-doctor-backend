import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Auth ────────────────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login with email & password' })
  async login(@Body() adminLoginDto: AdminLoginDto) {
    return this.adminService.login(adminLoginDto, this.jwtService);
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  @Get('dashboard/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/trends')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get dashboard trends for charts' })
  async getDashboardTrends() {
    return this.adminService.getDashboardTrends();
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all registered patients/users' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  // ─── Doctors ─────────────────────────────────────────────────────────────────

  @Get('doctors')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all doctors' })
  async getAllDoctors(@Query('status') status?: string) {
    return this.adminService.getAllDoctors(status);
  }

  @Patch('doctors/:id/toggle-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle doctor active/inactive status' })
  async toggleDoctorStatus(@Param('id') id: string, @Request() req: any) {
    return this.adminService.toggleDoctorStatus(id, req.user.sub);
  }

  // ─── Bookings ────────────────────────────────────────────────────────────────

  @Get('bookings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all bookings' })
  async getAllBookings(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAllBookings(status, startDate, endDate);
  }

  @Patch('bookings/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking status (e.g. Confirmed, Cancelled, Completed)' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Request() req: any,
  ) {
    return this.adminService.updateBookingStatus(id, dto.status, req.user.sub, dto.remarks);
  }

  // ─── Payments ────────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all payments' })
  async getAllPayments(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAllPayments(status, startDate, endDate);
  }

  @Patch('payments/:id/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually verify a payment as Success or Rejected' })
  async verifyPayment(@Param('id') id: string, @Body() dto: VerifyPaymentDto, @Request() req: any) {
    return this.adminService.verifyPayment(id, dto.status, req.user.sub, dto.remarks);
  }



  // ─── Assignments ─────────────────────────────────────────────────────────────

  @Post('assignments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assign a doctor to a booking' })
  async assignDoctor(@Request() req: any, @Body() dto: AssignDoctorDto) {
    return {
      success: true,
      data: await this.adminService.assignDoctor(dto, req.user.sub),
    };
  }

  @Get('assignments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all doctor assignments' })
  async getAllAssignments() {
    return this.adminService.getAllAssignments();
  }

  @Patch('assignments/:id/revoke')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revoke a doctor assignment' })
  async revokeAssignment(@Param('id') id: string) {
    return {
      success: true,
      data: await this.adminService.revokeAssignment(id),
    };
  }
}
