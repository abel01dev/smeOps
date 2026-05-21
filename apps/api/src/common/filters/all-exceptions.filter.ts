import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

interface ErrorBody {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
  details?: unknown;
}

/**
 * Catch-all exception filter.
 *
 * Goals:
 *  1. Never leak internal stack traces to clients in production.
 *  2. Normalize the response shape so the frontend has a single error parser.
 *  3. Translate well-known Prisma errors into useful 4xx responses
 *     (e.g. unique constraint -> 409 Conflict, not found -> 404).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "InternalServerError";
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string) ?? exception.message;
        error = (r.error as string) ?? exception.name;
        if (r.details !== undefined) details = r.details;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ statusCode, message, error } = mapPrismaError(exception));
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    if (response.headersSent) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode} ${message} (response already started — cannot send JSON body)`,
        exception instanceof Error ? exception.stack : undefined,
      );
      if (!response.writableEnded) {
        response.end();
      }
      return;
    }

    const body: ErrorBody = {
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(details !== undefined ? { details } : {}),
    };

    response.status(statusCode).json(body);
  }
}

function mapPrismaError(
  err: Prisma.PrismaClientKnownRequestError,
): { statusCode: number; message: string; error: string } {
  switch (err.code) {
    case "P2002":
      return {
        statusCode: HttpStatus.CONFLICT,
        message: `Duplicate value for ${(err.meta?.target as string[] | undefined)?.join(", ") ?? "unique field"}`,
        error: "Conflict",
      };
    case "P2003":
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Related record not found (foreign key constraint failed)",
        error: "BadRequest",
      };
    case "P2025":
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Record not found",
        error: "NotFound",
      };
    case "P2021":
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          "Database schema is out of date. Run: pnpm --filter @sme/api exec prisma migrate deploy",
        error: "ServiceUnavailable",
      };
    case "P1001":
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          "Cannot reach the database server. Check Supabase is running (unpause project), your internet/VPN, and apps/api/.env DATABASE_URL — use Session pooler port 5432 or the direct db.*.supabase.co host (see apps/api/.env.example).",
        error: "ServiceUnavailable",
      };
    default:
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Database error: ${err.code}`,
        error: "BadRequest",
      };
  }
}
