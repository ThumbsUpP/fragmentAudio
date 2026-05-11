const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  limit: number;
  offset: number;
}

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const rawLimit = Number(query.limit ?? DEFAULT_LIMIT);
  const rawOffset = Number(query.offset ?? 0);

  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = Number.isFinite(rawOffset) ? Math.max(Math.trunc(rawOffset), 0) : 0;

  return { limit, offset };
};
