import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileSignatureInterceptor } from '../../common/utils/file-signature.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { documentFileFilter, MAX_UPLOAD_BYTES } from '../../common/utils/upload';

const uploadDir = './uploads/payments';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @Roles('Patient')
  @ApiOperation({ summary: 'Initiate a payment for a booking' })
  async initiate(@Request() req: any, @Body() initiatePaymentDto: InitiatePaymentDto) {
    return {
      success: true,
      data: await this.paymentsService.initiatePayment(req.user, initiatePaymentDto),
    };
  }

  @Get('status/:transactionId')
  @ApiOperation({ summary: 'Check payment status using Transaction ID' })
  async getStatus(@Request() req: any, @Param('transactionId') transactionId: string) {
    return {
      success: true,
      data: await this.paymentsService.getPaymentStatus(req.user, transactionId),
    };
  }

  @Post('upload')
  @Roles('Patient')
  @ApiOperation({ summary: 'Upload a payment proof screenshot' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: documentFileFilter,
  }), FileSignatureInterceptor)
  async uploadPaymentProof(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('bookingId') bookingId: string,
    @Body('amount') amount: number,
    @Body('transactionId') transactionId: string,
  ) {
    return {
      success: true,
      data: await this.paymentsService.uploadPaymentProof(req.user, bookingId, file, amount, transactionId),
    };
  }

  @Post('verify/:paymentId')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Verify a payment (Admin only ideally)' })
  async verifyPayment(
    @Request() req: any,
    @Param('paymentId') paymentId: string,
    @Body('status') status: string,
    @Body('remarks') remarks?: string,
  ) {
    // Assuming req.user.id is the admin ID verifying it
    return {
      success: true,
      data: await this.paymentsService.verifyPayment(paymentId, req.user.id, status, remarks),
    };
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get payment details for a specific booking' })
  async getByBookingId(@Request() req: any, @Param('bookingId') bookingId: string) {
    return {
      success: true,
      data: await this.paymentsService.getPaymentByBookingId(req.user, bookingId),
    };
  }
}
