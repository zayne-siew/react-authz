import type { Tables, TablesInsert, TablesUpdate } from '#src/database.gen.ts';
import type { EmployeeRole } from './employee_role.ts';

type BaseEmployee = Tables<'employees'>;
export type CreateEmployee = TablesInsert<'employees'>;
export type UpdateEmployee = TablesUpdate<'employees'>;

export type Employee = BaseEmployee & { role: EmployeeRole | null };
