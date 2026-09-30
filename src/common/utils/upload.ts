import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Multer fileFilter: allow only PDFs and common image types. */
export const documentFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext) || !ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new BadRequestException('Only PDF, JPG, PNG or WEBP files are allowed'), false);
  }
  cb(null, true);
};
