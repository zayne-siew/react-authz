import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.enum(['development', 'production']).default('production'),
  VITE_APP_URL: z.string().url(),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),

  FGA_CLIENT_ID: z.string().optional(),
  FGA_API_TOKEN_ISSUER: z.string().optional(),
  FGA_API_AUDIENCE: z.string().optional(),
  FGA_CLIENT_SECRET: z.string().optional(),
  FGA_STORE_ID: z.string(),
  FGA_AUTHORIZATION_MODEL_ID: z.string(),
  FGA_API_URL: z.string().url().default('http://localhost:8080'),

  OTEL_SERVICE_NAME: z.string(),
});

// Validate and export the environment
export const env = appEnvVariablesSchema.parse({
  VITE_NODE_ENV: process.env.VITE_NODE_ENV,
  VITE_APP_URL: process.env.VITE_APP_URL,

  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,

  FGA_CLIENT_ID: process.env.FGA_CLIENT_ID,
  FGA_API_TOKEN_ISSUER: process.env.FGA_API_TOKEN_ISSUER,
  FGA_API_AUDIENCE: process.env.FGA_API_AUDIENCE,
  FGA_CLIENT_SECRET: process.env.FGA_CLIENT_SECRET,
  FGA_STORE_ID: process.env.FGA_STORE_ID,
  FGA_AUTHORIZATION_MODEL_ID: process.env.FGA_AUTHORIZATION_MODEL_ID,
  FGA_API_URL: process.env.FGA_API_URL,

  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
