export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export interface Paging {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Parse ?page / ?pageSize query values (1-based page). Always bounded so a list endpoint never returns a whole table. */
export function parsePaging(page?: string | number, pageSize?: string | number): Paging {
  const p = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(String(pageSize ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  return { page: p, pageSize: size, skip: (p - 1) * size, take: size };
}
