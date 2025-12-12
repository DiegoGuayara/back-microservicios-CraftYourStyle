/**
 * Microservicio de Transacciones - CraftYourStyle
 * 
 * Este microservicio maneja la gestión de cuentas bancarias para transacciones:
 * - Registro de cuentas bancarias (débito/crédito)
 * - Consulta de cuentas por usuario
 * - Actualización de información de cuentas
 * - Eliminación de cuentas
 * - Integración con microservicio de usuarios
 * 
 * Puerto: 10101
 * Base de datos: CraftYourStyle_Transacciones
 */

import express from "express";
import type { Request, Response } from "express";
import router from "./routes/transaccionesRoutes.js";

const app = express()
const PORT = process.env.PORT || 10101

// Middleware para parsear JSON en las peticiones
app.use(express.json())

// Rutas del microservicio de transacciones
app.use("/transacciones", router)

// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (req: Request, res:Response) => {
    res.send("Servicio de Transacciones")
})

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de transacciones corriendo en el puerto ${PORT}`);
})
