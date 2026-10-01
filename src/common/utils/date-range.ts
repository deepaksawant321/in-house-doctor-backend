import { BadRequestException } from '@nestjs/common';
import { Between, FindOperator, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

/**
 * Turns optional YYYY-MM-DD query params into an inclusive TypeORM date filter (either bound may be omitted).
 *
 * Timestamps are stored as server wall-clock time and the mssql driver reads/writes them as UTC, so day
 * boundaries are built with UTC setters; using local setters shifts the end of day by the server's UTC offset.
 */
export function parseDateRange(startDate?: string, endDate?: string): FindOperator<Date> | undefined {
  if (!startDate && !endDate) return undefined;
  const parse = (v: string, endOfDay: boolean): Date => {
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00.000Z` : v);
    if (isNaN(d.getTime())) throw new BadRequestException('Invalid date range');
    if (endOfDay) d.setUTCHours(23, 59, 59, 999);
    return d;
  };
  const start = startDate ? parse(startDate, false) : undefined;
  const end = endDate ? parse(endDate, true) : undefined;
  if (start && end && start > end) throw new BadRequestException('startDate must not be after endDate');
  if (start && end) return Between(start, end);
  return start ? MoreThanOrEqual(start) : LessThanOrEqual(end as Date);
}
