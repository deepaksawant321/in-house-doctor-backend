import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileSignatureInterceptor } from '../../common/utils/file-signature.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MedicalRecordsService } from './medical-records.service';
import { UploadRecordDto } from './dto/upload-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { documentFileFilter, MAX_UPLOAD_BYTES } from '../../common/utils/upload';
import * as fs from 'fs';

const uploadDir = './uploads/MedicalRecords';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('MedicalRecords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Patient')
@Controller('api/medical-records')
export class MedicalRecordsController {
  constructor(private readonly MedicalRecordsService: MedicalRecordsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a medical record' })
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
  upload(@Request() req: any, @UploadedFile() file: Express.Multer.File, @Body() uploadRecordDto: UploadRecordDto) {
    return this.MedicalRecordsService.uploadRecord(req.user.id, file, uploadRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical MedicalRecords for the authenticated user\'s patients' })
  findAll(@Request() req: any) {
    return this.MedicalRecordsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medical record by ID' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.MedicalRecordsService.findOne(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific medical record' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.MedicalRecordsService.remove(req.user.id, id);
  }
}
