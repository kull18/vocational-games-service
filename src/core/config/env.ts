import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_NAME: string;
  JWT_SECRET: string;
}

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required but was not provided.`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: getEnvOrThrow('DB_HOST'),
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: getEnvOrThrow('DB_USER'),
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: getEnvOrThrow('DB_NAME'),
  JWT_SECRET: getEnvOrThrow('JWT_SECRET'),
};
