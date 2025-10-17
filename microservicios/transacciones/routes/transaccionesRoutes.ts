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
router.put("/actualizarCuenta/:id_user/:id", TransaccionesController.updateUser.bind(transaccionesController));

export default router;