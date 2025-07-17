import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

import { api } from '#src/lib/api.ts';
import type { CreateEmployee, Employee, UpdateEmployee } from '#types/employee';

/**
 * Limit to number of employees to query.
 */
export const EMPLOYEE_QUERY_LIMIT = 50;

export const EmployeeContext = createContext<Employee | null>(null);

export function useCurrentEmployee() {
  return useContext(EmployeeContext);
}

// TanStack Query cache keys
const EMPLOYEES_KEY = 'employees';
const EMPLOYEE_KEY = 'employee';
const EMPLOYEE_COUNT_KEY = 'employee-count';

export function useGetEmployees(
  page: number = 1,
  limit: number = EMPLOYEE_QUERY_LIMIT,
) {
  return useQuery<Employee[]>({
    queryKey: [EMPLOYEES_KEY, { page, limit }],
    queryFn: async () => {
      const result = await api.employee.$get({
        query: { page: page.toString(), limit: limit.toString() },
      });
      if (!result.ok) {
        throw new Error('Failed to fetch employees');
      }

      const employees = await result.json();
      return employees as Employee[];
    },
  });
}

export function useEmployeeCount() {
  return useQuery<number>({
    queryKey: [EMPLOYEE_COUNT_KEY],
    queryFn: async () => {
      const result = await api.employee.count.$get();
      if (result.status === 404) {
        return 0; // No employees found
      }

      if (!result.ok) {
        throw new Error('Failed to fetch employee count');
      }

      const count = await result.json();
      return (count as { value: number }).value;
    },
  });
}

export function useGetEmployee(id: string) {
  return useQuery<Employee | null>({
    queryKey: [EMPLOYEE_KEY, id],
    queryFn: async () => {
      const result = await api.employee[':id'].$get({
        param: { id },
      });

      if (result.status === 404) {
        return null; // Employee not found
      }

      if (!result.ok) {
        throw new Error('Failed to fetch employee');
      }

      const employee = await result.json();
      return employee as Employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, CreateEmployee>({
    mutationFn: async (newEmployee) => {
      const result = await api.employee.$post({
        json: newEmployee,
      });

      if (!result.ok) {
        throw new Error('Failed to create employee');
      }

      const employee = await result.json();
      return employee as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_COUNT_KEY] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, { id: string; updates: UpdateEmployee }>({
    mutationFn: async ({ id, updates }) => {
      const result = await api.employee[':id'].$put({
        param: { id },
        json: updates,
      });

      if (!result.ok) {
        throw new Error('Failed to update employee');
      }

      const employee = await result.json();
      return employee as Employee;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const result = await api.employee[':id'].$delete({
        param: { id },
      });

      if (!result.ok) {
        throw new Error('Failed to delete employee');
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_COUNT_KEY] });
    },
  });
}
