import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as adminController from "../../controllers/admin.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);
adminRouter.get("/uploads/pending", asyncHandler(adminController.pendingUploads));
adminRouter.patch("/uploads/:fileId/approve", asyncHandler(adminController.approveUpload));
adminRouter.patch("/uploads/:fileId/reject", asyncHandler(adminController.rejectUpload));
adminRouter.get("/analytics", asyncHandler(adminController.analytics));
