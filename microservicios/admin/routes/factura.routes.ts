import { Router } from "express";
import { FacturaController } from "../controllers/factura.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/crear", requireAdmin, (req, res) => FacturaController.crearFactura(req, res));
router.get("/usuario/:id_usuario", requireAdmin, (req, res) => FacturaController.obtenerFacturasPorUsuario(req, res));
router.get("/:id", requireAdmin, (req, res) => FacturaController.obtenerFacturaPorId(req, res));
router.post("/:id/enviar-correo", requireAdmin, (req, res) => FacturaController.enviarFacturaPorCorreo(req, res));

export default router;
