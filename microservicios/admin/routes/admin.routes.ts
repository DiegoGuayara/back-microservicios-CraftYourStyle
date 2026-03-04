import { Router } from "express";

const router = Router();

import { AdminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

router.post("/verificacionAdmin", requireAdmin, AdminController.verificaciondeAdmin);
router.post("/crearCategoria", requireAdmin, AdminController.crearCategoria);
router.post("/crearProducto", requireAdmin, AdminController.crearProducto);

export default router;
