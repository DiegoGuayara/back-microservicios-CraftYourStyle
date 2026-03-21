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
router.get(
  "/obtenerVariantesPorProducto/:producto_id",
  VariantProductosController.obtenerVariantesPorProducto
);
router.patch(
  "/actualizarVariante/:id",
  VariantProductosController.actualizarVariantProductoPorId
);
router.patch(
  "/descontarStock/:id",
  VariantProductosController.descontarStockPorId
);
router.delete(
  "/eliminarVariante/:id",
  VariantProductosController.eliminarVariantProductoPorId
);

export default router;
