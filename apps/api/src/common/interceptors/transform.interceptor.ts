import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((data) => ({ success: true, data })));
  }
}
