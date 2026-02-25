import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import pagosRoutes from "./routes/pagosRoutes.js";
import { closeConnection, connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10103;

app.use(express.json());
app.use("/pagos", pagosRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("Servicio de Pagos");
});

app.listen(PORT, async () => {
  console.log(`Servidor de pagos corriendo en el puerto ${PORT}`);

  try {
    await connectRabbitMQ();
    console.log("🐰 RabbitMQ inicializado correctamente");
  } catch (error) {
    console.error("❌ Error inicializando RabbitMQ:", error);
  }
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Cerrando servidor...");
  await closeConnection();
  process.exit(0);
});
