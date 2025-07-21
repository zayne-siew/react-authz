import {
  CredentialsMethod,
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
  FGA_AUTHORIZATION_MODEL_ID,
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

const fgaClient = new OpenFgaClient({
  apiUrl: FGA_API_URL,
  storeId: FGA_STORE_ID,
  authorizationModelId: FGA_AUTHORIZATION_MODEL_ID,
  credentials,
  telemetry: TELEMETRY_CONFIG,
});

export default fgaClient;
