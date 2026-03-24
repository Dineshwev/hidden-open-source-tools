import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as fileController from "../../controllers/file.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { uploadSingle } from "../../middleware/upload.js";

export const fileRouter = Router();

fileRouter.get("/", asyncHandler(fileController.listApprovedFiles));
fileRouter.get("/trending", asyncHandler(fileController.listTrendingFiles));
fileRouter.get("/my-submissions", authenticate, asyncHandler(fileController.listMySubmissions));
fileRouter.post("/upload", authenticate, uploadSingle, asyncHandler(fileController.uploadFile));
