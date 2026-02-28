import { Router } from "express";

const router = Router();

import { AdminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

router.post("/verificacionAdmin", requireAdmin, AdminController.verificaciondeAdmin);

export default router;
