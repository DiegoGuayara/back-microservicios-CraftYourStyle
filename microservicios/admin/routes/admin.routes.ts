import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";

const router = Router();

router.post("/crearAdmin", AdminController.crearAdmin);
router.get("/obtenerAdmins", AdminController.obtenerAdmins);
router.get("/obtenerAdmin/:id", AdminController.obtenerAdminPorId);
router.patch("/actualizarAdmin/:id", AdminController.actualizarAdmin);
router.delete("/eliminarAdmin/:id", AdminController.eliminarAdmin);

router.post("/asignarPermiso", AdminController.asignarPermiso);
router.get("/obtenerPermisos/:id_admin", AdminController.obtenerPermisosPorAdmin);
router.delete("/eliminarPermiso/:id_admin/:permiso", AdminController.eliminarPermiso);

router.post("/registrarAuditoria", AdminController.registrarAuditoria);
router.get("/obtenerAuditoria", AdminController.obtenerAuditoria);
router.get("/obtenerAuditoria/:id_admin", AdminController.obtenerAuditoria);

export default router;
