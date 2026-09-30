import { BadRequestException } from '@nestjs/common';
import { MAX_UPLOAD_BYTES } from '../../common/utils/upload';
import { Controller, Get, Put, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileSignatureInterceptor } from '../../common/utils/file-signature.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// The QR image is served publicly, so only raster images (no PDF/SVG/HTML) are accepted
const imageOnlyFilter = (_req: any, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) =>
  /\.(png|jpe?g|webp)$/i.test(file.originalname) && /^image\/(png|jpeg|webp)$/.test(file.mimetype)
    ? cb(null, true)
    : cb(new BadRequestException('Only PNG, JPG or WEBP images are allowed'), false);

const uploadDir = './uploads/settings';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Settings')
@Controller('api/admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Get platform settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Update platform settings' })
  async updateSettings(@Body() data: any, @Request() req: any) {
    return this.settingsService.updateSettings(data, req.user.sub);
  }

  @Post('upload-qr')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Upload Global UPI QR Code' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `upi-qr-${uniqueSuffix}${ext.toLowerCase()}`);
      }
    }),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: imageOnlyFilter,
  }), FileSignatureInterceptor)
  uploadQrCode(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('A file is required');
    const fileUrl = `/uploads/settings/${file.filename}`;
    return {
      success: true,
      data: { fileUrl }
    };
  }
}
