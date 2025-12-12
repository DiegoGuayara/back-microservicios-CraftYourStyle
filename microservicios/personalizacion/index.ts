/**
 * Microservicio de Personalización - CraftYourStyle
 * 
 * Este microservicio maneja la personalización de productos:
 * - Creación de personalizaciones (color, imagen, texto, tipo de letra)
 * - Consulta de personalizaciones
 * - Actualización y eliminación de personalizaciones
 * - Asociación con variantes de productos (variant_id)
 * 
 * Puerto: 10102
 * Base de datos: CraftYourStyle_Personalizacion
 */

import express from "express";
import type { Request, Response } from "express";
import personalizacionRoutes from "./routes/personalizacion.routes.js";

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
app.listen(PORT, () => {
    console.log(`Servidor de Personalizacion corriendo en el puerto ${PORT}`);
})
