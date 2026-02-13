import { Router } from "express";
import { CatalogoController } from "../controllers/catalogo.controller";

const router = Router();

router.post("/crearCategoria", CatalogoController.crearCategoria);
router.get("/obtenerCategorias", CatalogoController.obtenerCategorias);
router.get("/obtenerCategoria/:id", CatalogoController.obtenerCategoriaPorId);
router.patch(
  "/actualizarCategoria/:id",
  CatalogoController.actualizarCategoriaPorId
);
router.delete(
  "/eliminarCategoria/:id",
  CatalogoController.eliminarCategoriaPorId
);

export default router;
