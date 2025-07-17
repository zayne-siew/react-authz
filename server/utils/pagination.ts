import { z } from 'zod';

/**
 * Template page parameter for pagination in querying.
 */
export const PAGE_PARAM = z.coerce
  .number()
  .int('Page must be a positive integer')
  .positive('Page must be a positive integer')
  .default(1);

/**
 * Template limit parameter for pagination in querying.
 */
export const LIMIT_PARAM = z.coerce
  .number()
  .int('Limit must be a positive integer')
  .positive('Limit must be a positive integer')
  .optional();

/**
 * Calculates the offset to return to the drizzle query function given the page number and page limit.
 * Assumes that both `page` and `limit` are positive integers.
 */
export function getOffset(page: number, limit: number): number {
  return limit * (page - 1);
}
