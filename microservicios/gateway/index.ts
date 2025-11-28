import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1010;

// Usar nombres de servicio de docker-compose por defecto; permitimos override por ENV
const routes = {
  "/api/transacciones": {
    target: process.env.TRANSACCIONES_URL || "http://transacciones:10101",
    pathRewrite: { "^/api/transacciones": "" },
  },
  "/api/personalizacion": {
    target: process.env.PERSONALIZACION_URL || "http://personalizacion:10102",
    pathRewrite: { "^/api/personalizacion": "" },
  },
  "/api/catalogo": {
    target: process.env.CATALOGO_URL || "http://catalogo:10103",
    pathRewrite: { "^/api/catalogo": "" },
  },
  "/api/notificaciones": {
    target: process.env.NOTIFICACIONES_URL || "http://notificaciones:10104",
    pathRewrite: { "^/api/notificaciones": "" },
  },
  "/api/usuarios": {
    target: process.env.USUARIOS_URL || "http://localhost:8080/v1/usuarios",
    pathRewrite: { "^/api/usuarios": "" },
  },
};

Object.entries(routes).forEach(([path, config]) => {
  const proxy = createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    on: {
      proxyReq: (_proxyReq, req, _res) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${path} -> ${config.target}`);
      },
      error: (err, req, res) => {
        console.error(`Error en proxy ${path}:`, err.message);
        if ('headersSent' in res && !res.headersSent) {
          (res as any).status(502).json({ error: "Error al conectar con el servicio" });
        }
      },
    },
  });
  
  app.use(path, proxy);
});

app.get("/", (req, res) => {
  res.send("Gateway API is running");
});

app.listen(PORT, () => {
  console.log(`Gateway API is running on port ${PORT}`);
  console.log("Rutas configuradas:");
  Object.entries(routes).forEach(([path, config]) => {
    console.log(`  ${path} -> ${config.target}`);
  });
});
