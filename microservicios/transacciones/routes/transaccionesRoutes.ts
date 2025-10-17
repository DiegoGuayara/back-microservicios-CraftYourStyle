import { TransaccionesController } from "../controllers/transaccionesController.js";
import { Router } from "express";

const router = Router();
const transaccionesController = TransaccionesController;

router.post(
  "/crearCuenta",
  TransaccionesController.crearTransaccion.bind(transaccionesController)
);
router.get(
  "/obtenerCuentas/:id_user",
  TransaccionesController.obtenerCuentas.bind(transaccionesController)
);
router.patch("/actualizarCuenta/:id_user/:id", TransaccionesController.updateUser.bind(transaccionesController));
router.delete("/eliminarCuenta/:id/:id_user", TransaccionesController.eliminarCuenta.bind(transaccionesController));
export default router;