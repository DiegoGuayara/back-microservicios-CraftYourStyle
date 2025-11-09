import { PersonalizacionController } from "../controllers/personalizacion.controller.js";
import { Router } from "express";

const router = Router();
const personalizacionController = PersonalizacionController;

router.get("/obtenerPersonalizacion", PersonalizacionController.getPersonalization.bind(personalizacionController));
router.post("/crearPersonalizacion", PersonalizacionController.crearPersonalizacion.bind(personalizacionController));
router.get("/obtenerPersonalizacion/:id", PersonalizacionController.getPersonalizationById.bind(personalizacionController));
router.patch("/actualizarPersonalizacion/:id", PersonalizacionController.updatePersonalizationById.bind(personalizacionController));
router.delete("/eliminarPersonalizacion/:id", PersonalizacionController.deletePersonalizationById.bind(personalizacionController));
export default router;