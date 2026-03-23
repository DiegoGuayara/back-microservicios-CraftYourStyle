/**
 * Microservicio de Transacciones - CraftYourStyle
 * 
 * Este microservicio maneja la gestión de cuentas bancarias para transacciones:
 * - Registro de cuentas bancarias (débito/crédito)
 * - Consulta de cuentas por usuario
 * - Actualización de información de cuentas
 * - Eliminación de cuentas
 * - Integración con microservicio de usuarios
 * - Mensajería con RabbitMQ
 * 
 * Puerto: 10101
 * Base de datos: CraftYourStyle_Transacciones
 */

import express from "express";
import type { Request, Response } from "express";
import router from "./routes/transaccionesRoutes.js";
import { connectRabbitMQ, startConsumer, closeConnection } from "./config/rabbitmq.js";
import { processMessage } from "./config/messageHandler.js";

const app = express()
const PORT = process.env.PORT || 10101

// Middleware para parsear JSON en las peticiones
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas del microservicio de transacciones
app.use("/transacciones", router)
// Compatibilidad: permite también /crearCuenta, /obtenerCuentas, etc. sin doble prefijo
app.use("/", router)

// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (req: Request, res:Response) => {
    res.send("Servicio de Transacciones")
})

// Función para inicializar RabbitMQ
async function initRabbitMQ() {
    try {
        await connectRabbitMQ();
        await startConsumer(processMessage);
        console.log("🐰 RabbitMQ inicializado correctamente");
    } catch (error) {
        console.error("❌ Error inicializando RabbitMQ:", error);
    }
}

// Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`Servidor de transacciones corriendo en el puerto ${PORT}`);
    
    // Inicializar RabbitMQ después de que el servidor esté listo
    await initRabbitMQ();
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
