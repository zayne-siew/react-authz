import type { Tables, TablesInsert, TablesUpdate } from '#src/database.gen.ts';

export type EmployeeRole = Tables<'employee_role'>;
export type CreateEmployeeRole = TablesInsert<'employee_role'>;
export type UpdateEmployeeRole = TablesUpdate<'employee_role'>;
