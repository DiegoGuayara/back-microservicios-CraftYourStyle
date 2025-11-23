"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 10102;
app.get('/', (req, res) => {
    res.send('Microservicio de Catálogo funcionando correctamente');
});
app.listen(PORT, () => {
    console.log(`Microservicio de Catálogo escuchando en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map