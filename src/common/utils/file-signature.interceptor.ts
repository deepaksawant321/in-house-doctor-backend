import { CallHandler, ExecutionContext, Injectable, NestInterceptor, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import { extname } from 'path';

/** Returns the extension family the file's leading bytes actually represent, or null if not an allowed type. */
export function detectSignature(buf: Buffer): 'pdf' | 'jpg' | 'png' | 'webp' | null {
  if (buf.length >= 5 && buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

/**
 * Runs after FileInterceptor. The extension/MIME type are client-supplied, so verify the file's real
 * content (magic bytes) matches an allowed type AND the extension; delete the file and reject otherwise.
 * If a file was supplied in `requireFile` mode it must be present.
 */
@Injectable()
export class FileSignatureInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const file: Express.Multer.File | undefined = req.file;
    if (file) {
      let kind: ReturnType<typeof detectSignature> = null;
      try {
        const fd = fs.openSync(file.path, 'r');
        const buf = Buffer.alloc(16);
        const n = fs.readSync(fd, buf, 0, 16, 0);
        fs.closeSync(fd);
        kind = detectSignature(buf.subarray(0, n));
      } catch {
        kind = null;
      }
      const ext = extname(file.originalname).toLowerCase().replace('.', '');
      const extKind = ext === 'jpeg' ? 'jpg' : ext;
      if (!kind || kind !== extKind || file.size === 0) {
        try { fs.unlinkSync(file.path); } catch { /* ignore */ }
        throw new BadRequestException('The uploaded file is empty, corrupt or not a genuine PDF, JPG, PNG or WEBP file');
      }
    }
    return next.handle();
  }
}
