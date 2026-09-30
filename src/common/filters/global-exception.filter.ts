import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Map well-known SQL Server errors to safe client errors (details stay in server logs only)
    if (exception instanceof QueryFailedError) {
      const code = (exception as any).number ?? (exception as any).driverError?.number;
      if (code === 2627 || code === 2601) {
        status = HttpStatus.CONFLICT;
        message = 'A record with the same unique value already exists';
      } else if (code === 547) {
        status = HttpStatus.CONFLICT;
        message = 'The operation conflicts with related records';
      } else if ([245, 8114, 8115, 8152, 8169, 515, 1007].includes(code)) {
        status = HttpStatus.BAD_REQUEST;
        message = 'One or more values are invalid or missing';
      }
    }
    // Malformed JSON / oversized body etc. thrown by body-parser
    if (!(exception instanceof HttpException) && (exception as any)?.status && (exception as any).status < 500) {
      status = (exception as any).status;
      message = status === 413 ? 'Request body too large' : 'Malformed request';
    }

    const errorResponse = {
      success: false,
      message: typeof message === 'string' ? message : (message as any).message || message,
      errors: typeof message === 'object' && (message as any).error ? [(message as any).error] : [],
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
