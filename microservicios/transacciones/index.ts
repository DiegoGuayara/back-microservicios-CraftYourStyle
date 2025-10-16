import express from "express";
import type { Request, Response } from "express";
import router from "./routes/transaccionesRoutes.js";

const app = express()
const PORT = process.env.PORT || 10101

app.use(express.json())
app.use("/transacciones", router)

app.get("/", (req: Request, res:Response) => {
    res.send("Servicio de Transacciones")
})

app.listen(PORT, () => {
    console.log(`Servidor de transacciones corriendo en el puerto ${PORT}`);
})