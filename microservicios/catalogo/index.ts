/**
 * Microservicio de Catálogo - CraftYourStyle
 * 
 * Este microservicio maneja toda la gestión del catálogo de productos:
 * - Productos y sus detalles
 * - Categorías
 * - Variantes de productos (tallas, colores, stock, precios)
 * - Tiendas
 */

import express from "express";
import dotenv from "dotenv";
import productosRouter from "./routes/productos.routes";
import catalogoRouter from "./routes/catalogo.routes";
import variantProductoRouter from "./routes/variant-producto.routes";
import tiendaRouter from "./routes/tienda.routes";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = 10103; // Puerto donde corre el microservicio de catálogo

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Rutas del microservicio
app.use("/productos", productosRouter);              // Rutas para gestión de productos
app.use("/catalogo", catalogoRouter);                // Rutas para gestión de categorías
app.use("/variantProductos", variantProductoRouter); // Rutas para gestión de variantes
app.use("/tienda", tiendaRouter);                    // Rutas para gestión de tiendas

// Ruta raíz para verificar que el microservicio está funcionando
app.get("/", (req, res) => {
  res.send("Microservicio de Catálogo funcionando correctamente");
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Microservicio de Catálogo escuchando en el puerto ${PORT}`);
});
