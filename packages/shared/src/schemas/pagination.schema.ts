import { z } from "zod";

/**
 * Standard pagination + sort query params used by all list endpoints.
 *
 *   ?page=1&pageSize=20&sortBy=createdAt&sortDir=desc
 *
 * Feature-specific filters (search, status, categoryId, ...) live in each
 * feature's own schema and are merged via .merge() / .extend().
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().trim().min(1).max(40).optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
