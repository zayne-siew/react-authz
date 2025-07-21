import {
  CredentialsMethod,
  type FgaObject,
  OpenFgaClient,
  TelemetryAttribute,
  type TelemetryConfig,
  TelemetryMetric,
} from '@openfga/sdk';
import type { AuthCredentialsConfig } from '@openfga/sdk/dist/credentials/types';

import { appEnvVariables } from '#server/env.ts';

const {
  FGA_API_AUDIENCE,
  FGA_API_TOKEN_ISSUER,
  FGA_API_URL,
  FGA_CLIENT_ID,
  FGA_CLIENT_SECRET,
  FGA_STORE_ID,
} = appEnvVariables;

let credentials: AuthCredentialsConfig | undefined;
if (
  FGA_CLIENT_ID &&
  FGA_CLIENT_SECRET &&
  FGA_API_AUDIENCE &&
  FGA_API_TOKEN_ISSUER
) {
  credentials = {
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: FGA_CLIENT_ID,
      clientSecret: FGA_CLIENT_SECRET,
      apiAudience: FGA_API_AUDIENCE,
      apiTokenIssuer: FGA_API_TOKEN_ISSUER,
    },
  };
}

const TELEMETRY_CONFIG: TelemetryConfig = {
  metrics: {
    [TelemetryMetric.CounterCredentialsRequest]: {
      attributes: new Set([
        TelemetryAttribute.UrlScheme,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.HttpRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
    [TelemetryMetric.HistogramRequestDuration]: {
      attributes: new Set([
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
    [TelemetryMetric.HistogramQueryDuration]: {
      attributes: new Set([
        TelemetryAttribute.FgaClientRequestBatchCheckSize,
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
  },
};

/**
 * OpenFGA client instance configured with the necessary credentials and telemetry.
 *
 * This client is used to interact with the OpenFGA API for authorization checks.
 */
const fgaClient = new OpenFgaClient({
  apiUrl: FGA_API_URL,
  storeId: FGA_STORE_ID,
  credentials,
  telemetry: TELEMETRY_CONFIG,
});

/**
 * Parses a string representation of an OpenFGA object into its type and id.
 *
 * The expected format is `"type:id"`, e.g., `"organization:acme"`.
 * If the format is invalid, the function throws an error.
 *
 * @example
 * const fgaObject = parseFgaObject('organization:acme');
 * console.log(fgaObject.type); // 'organization'
 * console.log(fgaObject.id);   // 'acme'
 */
export function parseFgaObject(fgaResult: string): FgaObject {
  if (!fgaResult.includes(':') || fgaResult.split(':').length !== 2) {
    throw new Error(
      `Invalid FGA object format: ${fgaResult}. Expected format is "type:id".`,
    );
  }

  const [type, id] = fgaResult.split(':');
  return {
    type,
    id,
  } as FgaObject;
}

/**
 * Parses an OpenFGA object into a string representation.
 *
 * @example
 * const result = stringifyFgaObject({ type: 'organization', id: 'acme' });
 * console.log(result); // 'organization:acme'
 */
export function stringifyFgaObject(fgaObject: FgaObject): string {
  return `${fgaObject.type}:${fgaObject.id}`;
}

export default fgaClient;
