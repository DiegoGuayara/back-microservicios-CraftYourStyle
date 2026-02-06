/**
 * Microservicio de Personalización - CraftYourStyle
 * 
 * Este microservicio maneja la personalización de productos:
 * - Creación de personalizaciones (color, imagen, texto, tipo de letra)
 * - Consulta de personalizaciones
 * - Actualización y eliminación de personalizaciones
 * - Asociación con variantes de productos (variant_id)
 * - Mensajería con RabbitMQ (envía a Transacciones)
 * 
 * Puerto: 10102
 * Base de datos: CraftYourStyle_Personalizacion
 */

import express from "express";
import type { Request, Response } from "express";
import personalizacionRoutes from "./routes/personalizacion.routes.js";
import { connectRabbitMQ, closeConnection } from "./config/rabbitmq.js";

const app = express()
const PORT = process.env.PORT || 10102

// Middleware para parsear JSON en las peticiones
app.use(express.json())

// Rutas del microservicio de personalización
app.use("/personalizacion", personalizacionRoutes)

// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (req: Request, res:Response) => {
    res.send("Servicio de Personalizacion")
})

// Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`Servidor de Personalizacion corriendo en el puerto ${PORT}`);
    
    // Inicializar RabbitMQ
    try {
        await connectRabbitMQ();
        console.log("🐰 RabbitMQ inicializado correctamente");
    } catch (error) {
        console.error("❌ Error inicializando RabbitMQ:", error);
    }
});

// Manejar cierre graceful
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
