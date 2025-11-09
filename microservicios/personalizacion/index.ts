import express from "express";
import type { Request, Response } from "express";
import personalizacionRoutes from "./routes/personalizacion.routes.js";

const app = express()
const PORT = process.env.PORT || 10101

app.use(express.json())
app.use("/personalizacion", personalizacionRoutes)

app.get("/", (req: Request, res:Response) => {
    res.send("Servicio de Personalizacion")
})

app.listen(PORT, () => {
    console.log(`Servidor de Personalizacion corriendo en el puerto ${PORT}`);
})