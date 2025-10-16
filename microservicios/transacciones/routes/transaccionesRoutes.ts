import { TransaccionesController } from "../controllers/transaccionesController.js";
import { Router } from "express";

const router = Router();
const transaccionesController = TransaccionesController;

router.post(
  "/crearTransaccion",
  TransaccionesController.crearTransaccion.bind(transaccionesController)
);
router.get(
  "/obtenerCuentas/:id_user",
  TransaccionesController.obtenerCuentas.bind(transaccionesController)
);

export default router;
