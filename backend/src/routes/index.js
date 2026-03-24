import { Router } from "express";
import { authRouter } from "./v1/auth.routes.js";
import { fileRouter } from "./v1/file.routes.js";
import { mysteryRouter } from "./v1/mystery.routes.js";
import { adminRouter } from "./v1/admin.routes.js";
import { categoryRouter } from "./v1/category.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/mystery", mysteryRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/categories", categoryRouter);
