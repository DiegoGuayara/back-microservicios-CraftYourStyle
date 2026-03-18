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

import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cors from "cors";
import { Buffer } from "node:buffer";

// Extend IncomingMessage to include body property added by express.json()
declare module "node:http" {
  interface IncomingMessage {
    body?: any;
  }
}

// Cargar variables de entorno desde archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 1010;
const DEFAULT_CORS_ORIGINS = ["http://localhost:5173"];
const DOCKER_FALLBACK_HOSTS = [
  "http://transacciones:10101",
  "http://agente-ia:10105",
  "http://catalogo:10103",
  "http://notificaciones:10104",
  "http://usuarios:8080",
  "http://admin:3000",
];

type RouteConfig = {
  target: string;
  pathRewrite: Record<string, string>;
  envVar?: string;
  isFallback?: boolean;
};

function parseCorsOrigins(value?: string) {
  const origins = value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : DEFAULT_CORS_ORIGINS;
}

function resolveTarget(envVar: string, fallback: string) {
  const target = process.env[envVar]?.trim();

  return {
    target: target || fallback,
    isFallback: !target,
  };
}

const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
); // Habilitar CORS para permitir peticiones desde el frontend
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
const transaccionesTarget = resolveTarget(
  "TRANSACCIONES_URL",
  "http://transacciones:10101"
);
const agenteIaTarget = resolveTarget("AGENTE_IA_URL", "http://agente-ia:10105");
const catalogoTarget = resolveTarget("CATALOGO_URL", "http://catalogo:10103");
const notificacionesTarget = resolveTarget(
  "NOTIFICACIONES_URL",
  "http://notificaciones:10104"
);
const usuariosTarget = resolveTarget("USUARIOS_URL", "http://usuarios:8080");
const adminTarget = resolveTarget("ADMIN_URL", "http://admin:3000");

const routes: Record<string, RouteConfig> = {
  "/api/transacciones": {
    target: transaccionesTarget.target,
    pathRewrite: { "^/api/transacciones": "" }, // Remueve /api/transacciones del path
    envVar: "TRANSACCIONES_URL",
    isFallback: transaccionesTarget.isFallback,
  },
  "/api/agente-ia": {
    target: agenteIaTarget.target,
    pathRewrite: { "^/api/agente-ia": "" }, // Remueve /api/agente-ia del path
    envVar: "AGENTE_IA_URL",
    isFallback: agenteIaTarget.isFallback,
  },
  "/api/generate": {
    target: agenteIaTarget.target,
    pathRewrite: { "^/api/generate": "/generate" }, // Compatibilidad legacy nanoService
    envVar: "AGENTE_IA_URL",
    isFallback: agenteIaTarget.isFallback,
  },
  "/api/catalogo": {
    target: catalogoTarget.target,
    pathRewrite: { "^/api/catalogo": "" }, // Remueve /api/catalogo del path
    envVar: "CATALOGO_URL",
    isFallback: catalogoTarget.isFallback,
  },
  "/api/notificaciones": {
    target: notificacionesTarget.target,
    pathRewrite: { "^/api/notificaciones": "" }, // Remueve /api/notificaciones del path
    envVar: "NOTIFICACIONES_URL",
    isFallback: notificacionesTarget.isFallback,
  },
  "/api/usuarios": {
    target: usuariosTarget.target,
    pathRewrite: { "^/api/usuarios": "" }, // Remueve /api/usuarios del path
    envVar: "USUARIOS_URL",
    isFallback: usuariosTarget.isFallback,
  },
  "/api/admin": {
    target: adminTarget.target,
    pathRewrite: { "^/api/admin": "/admin" }, // /api/admin/x -> /admin/x
    envVar: "ADMIN_URL",
    isFallback: adminTarget.isFallback,
  },
};

function logDeploymentWarnings() {
  const fallbackRoutes = Object.entries(routes).filter(([, config]) => config.isFallback);

  if (fallbackRoutes.length > 0) {
    console.warn("Advertencia: hay rutas usando targets por defecto del entorno local/Docker.");
    fallbackRoutes.forEach(([path, config]) => {
      console.warn(`  ${path} usa fallback. Define ${config.envVar} para despliegues.`);
    });
  }

  if (process.env.NODE_ENV === "production") {
    fallbackRoutes.forEach(([path, config]) => {
      if (DOCKER_FALLBACK_HOSTS.includes(config.target)) {
        console.warn(
          `[PRODUCTION] ${path} apunta a ${config.target}. En Render debes configurar ${config.envVar} con la URL real del microservicio.`
        );
      }
    });
  }
}

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
      error: (err: Error, req, res) => {
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
app.get("/", (_req: Request, res: Response) => {
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
  console.log(`CORS origins: ${corsOrigins.join(", ")}`);
  console.log("Rutas configuradas:");
  Object.entries(routes).forEach(([path, config]) => {
    console.log(`  ${path} -> ${config.target}`);
  });
  logDeploymentWarnings();
});
