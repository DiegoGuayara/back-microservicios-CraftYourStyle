/**
 * Gateway API - CraftYourStyle
 * 
 * Este es el punto de entrada único (API Gateway) para todos los microservicios del sistema.
 * Utiliza http-proxy-middleware para redirigir peticiones a los microservicios correspondientes.
 * 
 * Funcionalidades:
 * - Enrutamiento centralizado a todos los microservicios
 * - Logging de todas las peticiones
 * - Manejo de errores de conexión
 * - Configuración mediante variables de entorno
 */

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cors from "cors";
import { IncomingMessage } from "http";

// Extend IncomingMessage to include body property added by express.json()
declare module "http" {
  interface IncomingMessage {
    body?: any;
  }
}

// Cargar variables de entorno desde archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 1010;

app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el cuerpo de las peticiones

/**
 * Configuración de rutas del Gateway
 * 
 * Cada ruta del gateway se mapea a un microservicio específico.
 * Las URLs pueden ser configuradas mediante variables de entorno o usar valores por defecto.
 * 
 * pathRewrite: Elimina el prefijo /api/{servicio} antes de enviar al microservicio
 * Ejemplo: /api/transacciones/crearCuenta -> http://transacciones:10101/crearCuenta
 */
const routes = {
  "/api/transacciones": {
    target: process.env.TRANSACCIONES_URL || "http://transacciones:10101",
    pathRewrite: { "^/api/transacciones": "" }, // Remueve /api/transacciones del path
  },
  "/api/personalizacion": {
    target: process.env.PERSONALIZACION_URL || "http://personalizacion:10102",
    pathRewrite: { "^/api/personalizacion": "" }, // Remueve /api/personalizacion del path
  },
  "/api/catalogo": {
    target: process.env.CATALOGO_URL || "http://catalogo:10103",
    pathRewrite: { "^/api/catalogo": "" }, // Remueve /api/catalogo del path
  },
  "/api/notificaciones": {
    target: process.env.NOTIFICACIONES_URL || "http://notificaciones:10104",
    pathRewrite: { "^/api/notificaciones": "" }, // Remueve /api/notificaciones del path
  },
  "/api/usuarios": {
    target: process.env.USUARIOS_URL || "http://usuarios:8080",
    pathRewrite: { "^/api/usuarios": "" }, // Remueve /api/usuarios del path
  },
  "/api/admin": {
    target: process.env.ADMIN_URL || "http://admin:3000",
    pathRewrite: { "^/api/admin": "/admin" }, // /api/admin/x -> /admin/x
  },
};

/**
 * Configuración del middleware de proxy para cada ruta
 * 
 * Para cada ruta definida, se crea un proxy que:
 * 1. Redirige las peticiones al microservicio correspondiente
 * 2. Registra (log) cada petición con timestamp, método y destino
 * 3. Maneja errores de conexión y retorna respuesta 502 (Bad Gateway)
 */
Object.entries(routes).forEach(([path, config]) => {
  const proxy = createProxyMiddleware({
    target: config.target, // URL del microservicio destino
    changeOrigin: true, // Cambia el header 'Host' al del target
    pathRewrite: config.pathRewrite, // Reescribe el path antes de enviar
    on: {
      // Hook que se ejecuta antes de enviar la petición al microservicio
      proxyReq: (proxyReq, req, _res) => {
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${path} -> ${
            config.target
          }`
        );
        // Re-stream el body si fue consumido por express.json()
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      // Hook que se ejecuta cuando hay un error en la conexión
      error: (err, req, res) => {
        console.error(`Error en proxy ${path}:`, err.message);
        // Solo enviar respuesta si los headers no han sido enviados
        if ("headersSent" in res && !res.headersSent) {
          (res as any)
            .status(502) // Bad Gateway
            .json({ error: "Error al conectar con el servicio" });
        }
      },
    },
  });

  // Registrar el proxy en Express para esta ruta
  app.use(path, proxy);
});

/**
 * Ruta raíz del Gateway
 * GET /
 * 
 * Endpoint simple para verificar que el gateway está funcionando.
 */
app.get("/", (req, res) => {
  res.send("Gateway API is running");
});

/**
 * Iniciar el servidor Express
 * 
 * Escucha en el puerto configurado (por defecto 1010) y muestra:
 * - Puerto en el que está corriendo
 * - Lista de todas las rutas configuradas y sus destinos
 */
app.listen(PORT, () => {
  console.log(`Gateway API is running on port ${PORT}`);
  console.log("Rutas configuradas:");
  Object.entries(routes).forEach(([path, config]) => {
    console.log(`  ${path} -> ${config.target}`);
  });
});
