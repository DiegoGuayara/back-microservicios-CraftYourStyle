# Gateway API - CraftYourStyle

Gateway HTTP basado en Express que expone un unico dominio para el frontend y reenvia peticiones a los microservicios.

## Rutas publicas

| Prefijo publico | Destino configurado | Reescritura |
|---|---|---|
| `/api/transacciones` | `TRANSACCIONES_URL` | elimina `/api/transacciones` |
| `/api/agente-ia` | `AGENTE_IA_URL` | elimina `/api/agente-ia` |
| `/api/generate` | `AGENTE_IA_URL` | reescribe a `/generate` |
| `/api/catalogo` | `CATALOGO_URL` | elimina `/api/catalogo` |
| `/api/notificaciones` | `NOTIFICACIONES_URL` | elimina `/api/notificaciones` |
| `/api/usuarios` | `USUARIOS_URL` | elimina `/api/usuarios` |
| `/api/admin` | `ADMIN_URL` | reescribe `/api/admin/*` a `/admin/*` |

## Produccion en Render

- URL publica esperada del gateway: `https://back-microservicios-craftyourstyle-v3ae.onrender.com`
- El frontend debe usar esa URL como `VITE_GATEWAY_URL`.
- En Render no deben usarse los fallbacks de Docker (`http://usuarios:8080`, `http://catalogo:10103`, etc.).
- Configura estas variables en el servicio del gateway:
  - `TRANSACCIONES_URL`
  - `AGENTE_IA_URL`
  - `CATALOGO_URL`
  - `NOTIFICACIONES_URL`
  - `USUARIOS_URL`
  - `ADMIN_URL`
  - `CORS_ORIGINS`

## Variables de entorno

Ejemplo completo en [`C:\Users\USER\OneDrive\Desktop\back-front\back-microservicios-CraftYourStyle\microservicios\gateway\.env.example`](/C:/Users/USER/OneDrive/Desktop/back-front/back-microservicios-CraftYourStyle/microservicios/gateway/.env.example).

Variables soportadas:

```env
PORT=1010
TRANSACCIONES_URL=https://transacciones.onrender.com
AGENTE_IA_URL=https://agente-ia.onrender.com
CATALOGO_URL=https://catalogo.onrender.com
NOTIFICACIONES_URL=https://notificaciones.onrender.com
USUARIOS_URL=https://usuarios.onrender.com
ADMIN_URL=https://admin.onrender.com
CORS_ORIGINS=https://tu-frontend.onrender.com,http://localhost:5173
```

## Comportamiento importante

- El gateway acepta CORS desde los origenes definidos en `CORS_ORIGINS`.
- Si falta una variable `*_URL`, el gateway sigue arrancando con el target por defecto local y lo informa en logs.
- En `NODE_ENV=production` muestra advertencias si una ruta sigue apuntando a hosts internos de Docker.
- `GET /` responde `Gateway API is running`.

## Ejemplos de consumo

```txt
POST /api/usuarios/v1/usuarios/login
GET  /api/catalogo/productos
POST /api/admin/verificacionAdmin
POST /api/generate
POST /api/transacciones/crearCuenta
```

## Nota de compatibilidad

La documentacion anterior mencionaba `/api/personalizacion`, pero esa ruta no existe en el `index.ts` actual del gateway. Si el frontend la necesita, hay que agregarla explicitamente.
