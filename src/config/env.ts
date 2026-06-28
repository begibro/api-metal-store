import dotenv from "dotenv";

dotenv.config();

const MIN_SECRET_LENGTH = 32;

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not found.`);
  }

  return value.trim();
}

function requiredSecret(name: string): string {
  const value = requiredEnv(name).trim();

  if (value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `Environment variable ${name} must be at least ${MIN_SECRET_LENGTH} characters long for secure JWT signing.`,
    );
  }

  return value;
}

function parsePositiveNumber(name: string, rawValue: string | undefined, fallback: number): number {
  if (rawValue === undefined) {
    return fallback;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value <= 0 || Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a positive integer. Received: ${rawValue}`);
  }

  return value;
}

function parseBoolean(name: string, rawValue: string | undefined, fallback: boolean): boolean {
  if (rawValue === undefined) {
    return fallback;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error(`Environment variable ${name} must be "true" or "false". Received: ${rawValue}`);
}

function parsePort(rawValue: string | undefined, fallback: number): number {
  if (rawValue === undefined) {
    return fallback;
  }

  const port = Number(rawValue);
  if (!Number.isFinite(port) || port <= 0 || Number.isNaN(port)) {
    throw new Error(`Environment variable PORT must be a valid positive number. Received: ${rawValue}`);
  }

  return port;
}

function loadFrontendUrl(): string {
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (frontendUrl) {
    return frontendUrl;
  }

  if ((process.env.NODE_ENV ?? "development").trim() === "development") {
    return "http://localhost:3000";
  }

  throw new Error("Environment variable FRONTEND_URL is required in production.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT, 3000),
  databaseUrl: requiredEnv("DATABASE_URL"),
  jwtSecret: requiredSecret("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  frontendUrl: loadFrontendUrl(),
  corsAllowCredentials: parseBoolean("CORS_ALLOW_CREDENTIALS", process.env.CORS_ALLOW_CREDENTIALS, false),
  logLevel: process.env.LOG_LEVEL ?? "info",
  rateLimitWindowMs: parsePositiveNumber("RATE_LIMIT_WINDOW_MS", process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: parsePositiveNumber("RATE_LIMIT_MAX", process.env.RATE_LIMIT_MAX, 100),
};
