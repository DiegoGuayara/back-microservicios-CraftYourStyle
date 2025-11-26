import { Router } from "express";
import { VariantProductosController } from "../controllers/variant-producto.controller";

const router = Router();

router.post("/crearVariante", VariantProductosController.crearVariantProducto);
router.get(
  "/obtenerVariantes",
  VariantProductosController.obtenerVariantProducto
);
router.get(
  "/obtenerVariante/:id",
  VariantProductosController.obtenerVariantProductoPorId
);
router.put(
  "/actualizarVariante/:id",
  VariantProductosController.actualizarVariantProductoPorId
);
router.delete(
  "/eliminarVariante/:id",
  VariantProductosController.eliminarVariantProductoPorId
);

export default router;
