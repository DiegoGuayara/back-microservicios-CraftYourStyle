import { Router } from "express";
import { PagosController } from "../controllers/pagosController.js";

const router = Router();

router.post("/checkout/preference", PagosController.createPreference.bind(PagosController));
router.post("/webhook", PagosController.webhook.bind(PagosController));
router.get("/:externalReference/estado", PagosController.getStatusByExternalReference.bind(PagosController));

export default router;
