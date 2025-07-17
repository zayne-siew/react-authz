import { pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';

/**
 * Employee roles that can be used to grant permissions within the app.
 */
export const employeeRoleTable = pgTable('employee_role', {
  ...DEFAULT_COLUMNS,
  name: text('name').unique().notNull(),
  description: text('description'),
});
