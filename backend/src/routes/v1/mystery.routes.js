import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as mysteryController from "../../controllers/mystery.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const mysteryRouter = Router();

mysteryRouter.post("/unlock", authenticate, asyncHandler(mysteryController.unlock));
mysteryRouter.get("/history", authenticate, asyncHandler(mysteryController.history));
mysteryRouter.get("/daily", authenticate, asyncHandler(mysteryController.dailyReward));
