import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as authController from "../../controllers/auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
