import pino from "pino";
import pinoHttp from "pino-http";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true
          }
        }
      : undefined
});

export const httpLogger = pinoHttp({
  logger
});
