import { foreignKey, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { employeeRoleTable } from './employee_role.ts';

/**
 * General employee that will interface with the app.
 *
 * An employee may have one or more permissions associated with their {@link employeeRoles roles}.
 */
export const employeeTable = pgTable(
  'employees',
  {
    ...DEFAULT_COLUMNS,
    name: text('name').notNull(),
    role_id: integer('role_id'),
  },
  (table) => [
    foreignKey({
      name: 'employees_role_id_fkey',
      columns: [table.role_id],
      foreignColumns: [employeeRoleTable.id],
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
);

export const employeeRelations = relations(employeeTable, ({ one }) => ({
  role: one(employeeRoleTable, {
    fields: [employeeTable.role_id],
    references: [employeeRoleTable.id],
  }),
}));
