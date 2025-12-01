import { TiendaController } from "../controllers/tienda.controller";
import { Router } from "express";

const router = Router();
const tiendaController = TiendaController;

router.post('/crearTienda', TiendaController.createStore.bind(tiendaController));
router.get('/obtenerTiendas', TiendaController.getStores.bind(tiendaController));
router.get('/obtenerTienda/:id', TiendaController.getStoreById.bind(tiendaController));
router.patch('/actualizarTienda/:id', TiendaController.updateStoreById.bind(tiendaController));
router.delete('/eliminarTienda/:id', TiendaController.deleteStoreById.bind(tiendaController));

export default router