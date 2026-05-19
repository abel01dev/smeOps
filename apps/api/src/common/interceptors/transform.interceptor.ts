import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { SKIP_RESPONSE_TRANSFORM_KEY } from "../decorators/skip-response-transform.decorator";

export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Wrap every successful response in `{ success: true, data: ... }`.
 * Combined with AllExceptionsFilter's `{ statusCode, message, error, ... }`
 * shape on failures, the frontend has a single, predictable contract.
 *
 * Endpoints that need a different shape (e.g. file downloads, streams)
 * can use `@SkipResponseTransform()` later (we'll add that decorator if needed).
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return next.handle() as Observable<ApiResponse<T>>;
    return next.handle().pipe(map((data) => ({ success: true, data })));
  }
}
