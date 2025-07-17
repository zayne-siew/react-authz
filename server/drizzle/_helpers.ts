import {
  boolean,
  integer,
  type PgTimestampBuilderInitial,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Creates a timestamp column with standardized configuration.
 */
export function timestampCol(name: string): PgTimestampBuilderInitial<string> {
  return timestamp(name, {
    precision: 3,
    withTimezone: true,
  });
}

export const id = integer('id').primaryKey().generatedAlwaysAsIdentity();
export const createdAt = timestampCol('created_at').defaultNow().notNull();
export const updatedAt = timestampCol('updated_at')
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());
export const isActive = boolean('is_active').default(true);

export const DEFAULT_COLUMNS = {
  id,
  created_at: createdAt,
  updated_at: updatedAt,
  is_active: isActive,
};
