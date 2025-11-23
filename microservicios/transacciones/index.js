"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaccionesRoutes_js_1 = __importDefault(require("./routes/transaccionesRoutes.js"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 10101;
app.use(express_1.default.json());
app.use("/transacciones", transaccionesRoutes_js_1.default);
app.get("/", (req, res) => {
    res.send("Servicio de Transacciones");
});
app.listen(PORT, () => {
    console.log(`Servidor de transacciones corriendo en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map