import type { ClientBatchCheckItem, FgaObject } from '@openfga/sdk';

import { appEnvVariables } from '#server/env.ts';
import fgaClient from '#server/lib/openfga.ts';
import {
  parseFgaObject,
  stringifyFgaObject,
} from '#server/utils/openfga/index.ts';

const { FGA_AUTHORIZATION_MODEL_ID } = appEnvVariables;

/**
 * Get the organizations a user belongs to / is an admin of.
 */
export async function getUserOrganizations(
  user: FgaObject,
  admin: boolean = false,
): Promise<FgaObject[]> {
  const response = await fgaClient.listObjects(
    {
      user: stringifyFgaObject(user),
      relation: admin ? 'admin' : 'member',
      type: 'organization',
    },
    {
      authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
    },
  );

  if (response.$response.status !== 200) {
    console.error('Failed to fetch organizations:', response.$response);
    return [];
  } else {
    return response.objects.map(parseFgaObject);
  }
}

/**
 * Get all users in the specified organizations.
 */
export async function getUsersInOrganizations(
  organizations: FgaObject[],
): Promise<FgaObject[]> {
  if (organizations.length === 0) {
    console.warn('No organizations specified for user retrieval');
    return [];
  }

  const promises = organizations.map(async (organization) => {
    const response = await fgaClient.listUsers(
      {
        object: organization,
        relation: 'member',
        user_filters: [
          {
            type: 'user',
          },
        ],
      },
      {
        authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
      },
    );
    return response.users.map((user) => user.object).filter((user) => !!user);
  });

  const results = await Promise.allSettled(promises);
  const allUsers = new Set<FgaObject>();
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      result.value.forEach((user) => allUsers.add(user));
    } else {
      console.warn('Failed to fetch users:', result.reason);
    }
  });
  return Array.from(allUsers);
}

/**
 * Check if a user is part of the specified organizations.
 */
export async function isUserInOrganizations(
  user: FgaObject,
  organizations: FgaObject[],
): Promise<boolean> {
  if (organizations.length === 0) {
    console.warn('No organizations specified for user check');
    return false;
  }

  // Naive implementation: fetch all users in the organizations and check if the user exists
  // const users = await getUsersInOrganizations(organizations);
  // return users.some((u) => u.id === user.id);

  // Optimized implementation: batch check using OpenFGA
  const { result } = await fgaClient.batchCheck(
    {
      checks: organizations.map((org) => {
        const check: ClientBatchCheckItem = {
          user: stringifyFgaObject(user),
          relation: 'member',
          object: stringifyFgaObject(org),
        };
        return check;
      }),
    },
    {
      authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
    },
  );
  return result.some((check) => check.allowed);
}

/**
 * Get users in the same organizations as the specified user.
 *
 * This is useful for checking permissions or roles within the same organizational context.
 */
export async function getUsersInSameOrganizations(
  user: FgaObject,
  admin: boolean = false,
): Promise<FgaObject[]> {
  const organizations = await getUserOrganizations(user, admin);
  if (!organizations || organizations.length === 0) {
    console.warn('No organizations found for the user');
    return [];
  }
  return getUsersInOrganizations(organizations);
}
