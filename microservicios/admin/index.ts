import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import { verifyConnection } from "./config/db-config.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10104; // Puerto donde corre el microservicio de admin

app.use(express.json());
app.use("/admin", adminRoutes);

// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (_req: Request, res: Response) => {
  res.send("Microservicio de Admin funcionando correctamente");
});

// Iniciar el servidor
app.listen(PORT, async () => {
  console.log(`Microservicio de Admin escuchando en el puerto ${PORT}`);
  await verifyConnection();
});
