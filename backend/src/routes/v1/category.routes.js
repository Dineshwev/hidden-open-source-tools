import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as categoryController from "../../controllers/category.controller.js";

export const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(categoryController.listCategories));
