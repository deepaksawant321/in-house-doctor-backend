import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment booking' })
  async create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    return {
      success: true,
      data: await this.bookingsService.createBooking(req.user.id, createBookingDto),
    };
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all bookings globally (Admin only)' })
  async findAllBookings() {
    return {
      success: true,
      data: await this.bookingsService.findAllBookings(),
    };
  }

  @Get('my-bookings')
  @ApiOperation({ summary: 'Get all bookings for the logged-in user' })
  async findMine(@Request() req: any) {
    return {
      success: true,
      data: await this.bookingsService.findMyBookings(req.user.id),
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status (e.g. Cancelled, Confirmed)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('remarks') remarks?: string,
  ) {
    return {
      success: true,
      data: await this.bookingsService.updateStatus(id, status, remarks),
    };
  }

  @Patch('cancel/:id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(@Request() req: any, @Param('id') id: string) {
    return {
      success: true,
      data: await this.bookingsService.cancelBooking(req.user.id, id),
    };
  }

  @Post('rebook/:id')
  @ApiOperation({ summary: 'Rebook a previous appointment' })
  async rebook(
    @Request() req: any,
    @Param('id') id: string,
    @Body('scheduledDate') newDate: string,
  ) {
    return {
      success: true,
      data: await this.bookingsService.rebook(req.user.id, id, newDate),
    };
  }

  @Post(':id/prescriptions')
  @ApiOperation({ summary: 'Upload a prescription file for a booking' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/prescriptions',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `prescription-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadPrescription(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      success: true,
      data: await this.bookingsService.uploadPrescription(id, file),
    };
  }

  @Get(':id/prescriptions')
  @ApiOperation({ summary: 'Get prescriptions for a booking' })
  async getPrescriptions(@Param('id') id: string) {
    return {
      success: true,
      data: await this.bookingsService.getPrescriptions(id),
    };
  }
}
