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
  Query,
} from '@nestjs/common';
import { FileSignatureInterceptor } from '../../common/utils/file-signature.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { documentFileFilter, MAX_UPLOAD_BYTES } from '../../common/utils/upload';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('Patient')
  @ApiOperation({ summary: 'Create a new appointment booking' })
  async create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    return {
      success: true,
      data: await this.bookingsService.createBooking(req.user.id, createBookingDto),
    };
  }

  @Get('admin/all')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Get all bookings globally (Admin only)' })
  async findAllBookings(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return {
      success: true,
      ...(await this.bookingsService.findAllBookings(page, pageSize)),
    };
  }

  @Get('my-bookings')
  @Roles('Patient')
  @ApiOperation({ summary: 'Get all bookings for the logged-in user' })
  async findMine(@Request() req: any) {
    return {
      success: true,
      data: await this.bookingsService.findMyBookings(req.user.id),
    };
  }

  @Patch(':id/status')
  @Roles('Admin', 'SuperAdmin')
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
  @Roles('Patient')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(@Request() req: any, @Param('id') id: string) {
    return {
      success: true,
      data: await this.bookingsService.cancelBooking(req.user.id, id),
    };
  }

  @Post('rebook/:id')
  @Roles('Patient')
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
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: documentFileFilter,
    }),
    FileSignatureInterceptor,
  )
  async uploadPrescription(
    @Request() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      success: true,
      data: await this.bookingsService.uploadPrescription(req.user, id, file),
    };
  }

  @Get(':id/prescriptions')
  @ApiOperation({ summary: 'Get prescriptions for a booking' })
  async getPrescriptions(@Request() req: any, @Param('id') id: string) {
    return {
      success: true,
      data: await this.bookingsService.getPrescriptions(req.user, id),
    };
  }
}
