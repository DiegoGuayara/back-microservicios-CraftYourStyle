"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transaccionesController_js_1 = require("../controllers/transaccionesController.js");
const express_1 = require("express");
const router = (0, express_1.Router)();
const transaccionesController = transaccionesController_js_1.TransaccionesController;
router.post("/crearCuenta", transaccionesController_js_1.TransaccionesController.crearTransaccion.bind(transaccionesController));
router.get("/obtenerCuentas/:id_user", transaccionesController_js_1.TransaccionesController.obtenerCuentas.bind(transaccionesController));
router.patch("/actualizarCuenta/:id_user/:id", transaccionesController_js_1.TransaccionesController.updateUser.bind(transaccionesController));
router.delete("/eliminarCuenta/:id/:id_user", transaccionesController_js_1.TransaccionesController.eliminarCuenta.bind(transaccionesController));
exports.default = router;
//# sourceMappingURL=transaccionesRoutes.js.map