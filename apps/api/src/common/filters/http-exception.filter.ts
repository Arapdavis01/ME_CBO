import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") message = body;
      else if (typeof body === "object" && body !== null) {
        const b = body as { message?: string | string[]; code?: string };
        message = b.message ?? message;
        code = b.code;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      if (exception.code === "P2002") message = "A record with this value already exists";
      else if (exception.code === "P2025") {
        status = HttpStatus.NOT_FOUND;
        message = "Record not found";
      } else message = `Database error (${exception.code})`;
    } else if (exception instanceof Error) {
      this.logger.error(`${exception.message} — ${req.method} ${req.url}`);
      if (process.env.NODE_ENV !== "production") message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `[${status}] ${req.method} ${req.url} — ${JSON.stringify(message)}`,
      );
    }

    res.status(status).json({
      statusCode: status,
      message,
      code,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
