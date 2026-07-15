import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null && 'message' in response) {
        if (Array.isArray(response['message'])) {
          message = 'Validation failed';
          errors = response['message'];
        } else {
          message = response['message'] as string;
        }
      } else if (typeof response === 'string') {
        message = response;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[Unhandled Exception] ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const responseBody = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : undefined,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
