import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../../assets/uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "model/gltf-binary",
  "audio/mpeg",
  "video/mp4",
  "text/plain"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const safeExtension = path.extname(file.originalname);
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExtension}`);
  }
});

export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Unsupported file type"));
      return;
    }

    callback(null, true);
  }
}).single("file");
