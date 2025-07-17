import { hc } from 'hono/client';

import type { ApiRoutes } from '#server/index.ts';
import { getApiUrl } from '#src/utils/get-urls';

export const { api } = hc<ApiRoutes>(getApiUrl('/'), {});
