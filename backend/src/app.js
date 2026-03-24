import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { httpLogger } from "./config/logger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.resolve(__dirname, "../../assets");

export function createApp() {
  const app = express();

  app.use(httpLogger);
  app.use(
    cors({
      origin: env.FRONTEND_URL
    })
  );
  app.use(helmet());
  app.use(rateLimiter);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use("/assets", express.static(assetsPath, { maxAge: "1d", immutable: false }));

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true, name: "portfolio-universe-api" });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
