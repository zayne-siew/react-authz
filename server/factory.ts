import type { Env as _Env } from 'hono';
import { createFactory } from 'hono/factory';

import type { AppEnvVariables } from './zod/env.ts';

export interface RouteBindings extends _Env {
  Bindings: AppEnvVariables;
}

export const factory = createFactory<RouteBindings>();
