import { Router } from "express";
import { FacturaController } from "../controllers/factura.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/crear", requireAdmin, FacturaController.crearFactura);
router.get("/usuario/:id_usuario", requireAdmin, FacturaController.obtenerFacturasPorUsuario);
router.get("/:id", requireAdmin, FacturaController.obtenerFacturaPorId);
router.post("/:id/enviar-correo", requireAdmin, FacturaController.enviarFacturaPorCorreo);

export default router;
