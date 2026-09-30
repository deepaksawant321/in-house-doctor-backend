import { Controller, Get, Param, Request, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Response } from 'express';
import { join, resolve } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Payment } from '../../entities/payment.entity';
import { MedicalRecord } from '../../entities/medical-record.entity';
import { Prescription } from '../../entities/prescription.entity';
import { isAdminUser } from '../../common/utils/roles';

const FOLDERS = ['payments', 'MedicalRecords', 'prescriptions'] as const;
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/;

/**
 * Private file access. Uploaded medical/payment documents are NOT served statically; they are only
 * streamed here after checking that the caller is an admin or owns the record the file belongs to.
 * Unknown / unauthorised files always return the same 404 so file names cannot be probed.
 */
@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/files')
export class FilesController {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Prescription) private prescriptionRepo: Repository<Prescription>,
  ) {}

  private async canAccess(user: { id: string; role?: string }, folder: string, name: string): Promise<boolean> {
    if (isAdminUser(user)) {
      // Admin must still reference a real stored file
      return true;
    }
    const url = `/uploads/${folder}/${name}`;
    if (folder === 'payments') {
      return !!(await this.paymentRepo.findOne({ where: { screenshotPath: url, booking: { user: { id: user.id } } } }));
    }
    if (folder === 'MedicalRecords') {
      return !!(await this.recordRepo.findOne({ where: { fileUrl: url, patient: { user: { id: user.id } } } }));
    }
    const rows = await this.prescriptionRepo.find({ where: { booking: { user: { id: user.id } } } });
    return rows.some((p) => (p.filePath || '').split('\\').join('/').endsWith(`/${name}`));
  }

  @Get(':folder/:name')
  @ApiOperation({ summary: 'Download a private uploaded file (owner or admin only)' })
  async download(
    @Request() req: any,
    @Param('folder') folder: string,
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    if (!(FOLDERS as readonly string[]).includes(folder) || !SAFE_NAME.test(name) || name.includes('..')) {
      throw new NotFoundException('File not found');
    }
    if (!(await this.canAccess(req.user, folder, name))) throw new NotFoundException('File not found');

    const root = resolve(process.cwd(), 'uploads', folder);
    const full = resolve(join(root, name));
    if (!full.startsWith(root)) throw new NotFoundException('File not found');

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
    res.sendFile(full, (err) => {
      if (err && !res.headersSent) res.status(404).json({ success: false, message: 'File not found' });
    });
  }
}
