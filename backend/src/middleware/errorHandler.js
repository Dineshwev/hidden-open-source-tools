import { logger } from "../config/logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(error, _req, res, _next) {
  logger.error({ err: error }, "Unhandled request error");

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    details: error.details || null
  });
}
