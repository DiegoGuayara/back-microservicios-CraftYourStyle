import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 10104; // Puerto donde corre el microservicio de admin
app.use(express.json());
// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (req, res) => {
    res.send("Microservicio de Admin funcionando correctamente");
});
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Microservicio de Admin escuchando en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map