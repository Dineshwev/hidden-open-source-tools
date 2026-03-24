import "dotenv/config";

function requireEnv(name, fallback) {
  const value = process.env[name] || fallback;

  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(requireEnv("PORT", 5000)),
  FRONTEND_URL: requireEnv("FRONTEND_URL", "http://localhost:3000"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: requireEnv("JWT_EXPIRES_IN", "7d"),
  GITHUB_REPOSITORY_URL: process.env.GITHUB_REPOSITORY_URL || "",
  RATE_LIMIT_WINDOW_MS: Number(requireEnv("RATE_LIMIT_WINDOW_MS", 900000)),
  RATE_LIMIT_MAX_REQUESTS: Number(requireEnv("RATE_LIMIT_MAX_REQUESTS", 150)),
  MAX_FILE_SIZE_MB: Number(requireEnv("MAX_FILE_SIZE_MB", 50)),
  LOG_LEVEL: requireEnv("LOG_LEVEL", "info")
};
