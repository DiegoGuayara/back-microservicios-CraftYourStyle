import { Router } from "express";

const router = Router();

import { AdminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import facturaRoutes from "./factura.routes.js";

router.post("/verificacionAdmin", requireAdmin, AdminController.verificaciondeAdmin);
router.post("/crearCategoria", requireAdmin, AdminController.crearCategoria);
router.post("/crearProducto", requireAdmin, AdminController.crearProducto);
router.use("/facturas", facturaRoutes);

export default router;
