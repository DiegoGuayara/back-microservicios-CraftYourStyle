import { Router } from "express";
import { FacturaController } from "../controllers/factura.controller.js";
import { requireAdmin, requireAuthenticated } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", requireAdmin, (req, res) => FacturaController.obtenerTodasLasFacturas(req, res));
router.post("/crear", requireAdmin, (req, res) => FacturaController.crearFactura(req, res));
router.post("/crear-cliente", requireAuthenticated, (req, res) => FacturaController.crearFacturaCliente(req, res));
router.get("/usuario/:id_usuario", requireAdmin, (req, res) => FacturaController.obtenerFacturasPorUsuario(req, res));
router.get("/:id", requireAdmin, (req, res) => FacturaController.obtenerFacturaPorId(req, res));
router.post("/:id/enviar-correo", requireAdmin, (req, res) => FacturaController.enviarFacturaPorCorreo(req, res));

export default router;
