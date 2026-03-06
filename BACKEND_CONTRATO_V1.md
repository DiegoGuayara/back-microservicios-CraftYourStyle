# Backend Contrato V1

## Objetivo
Este documento define el contrato operativo vigente para integraciones front-back y marca rutas legacy en proceso de salida.

## Base oficial
- Gateway: `http://localhost:1010`

## Rutas oficiales (v1)
1. Auth
- `POST /api/usuarios/v1/usuarios`
- `POST /api/usuarios/v1/usuarios/login`
- `POST /api/usuarios/v1/usuarios/login/google`
- `POST /api/usuarios/v1/usuarios/logout`
- `GET /api/usuarios/v1/usuarios/me`

2. Catálogo
- `GET /api/catalogo/catalogo/obtenerCategorias`
- `GET /api/catalogo/productos/obtenerProductos`
- `GET /api/catalogo/productos/obtenerProducto/:id`
- `GET /api/catalogo/productos/obtenerProductosConDetalles/:categoria_id`
- `POST /api/catalogo/productos/crearProducto`
- `PATCH /api/catalogo/productos/actualizarProducto/:id`

3. Transacciones
- `POST /api/transacciones/transacciones/crearCuenta`
- `GET /api/transacciones/transacciones/obtenerCuentas/:id_user`
- `PATCH /api/transacciones/transacciones/actualizarCuenta/:id_user/:id`
- `DELETE /api/transacciones/transacciones/eliminarCuenta/:id/:id_user`

4. Facturas/Admin
- `POST /api/admin/facturas/crear`
- `GET /api/admin/facturas/:id`
- `GET /api/admin/facturas/usuario/:id_usuario`
- `POST /api/admin/facturas/:id/enviar-correo`

5. IA
- `POST /api/generate` (oficial para generación de imagen por compatibilidad de front actual)
- `POST /api/agente-ia/chat/session/:sesion_id/message`
- `POST /api/agente-ia/images/design`
- `POST /api/agente-ia/tryon/generate`

## Contrato de respuesta estándar
- Formato recomendado v1:
```json
{
  "message": "texto",
  "data": {}
}
```
- Auth mantiene además campos legacy en raíz para compatibilidad temporal.

## Rutas legacy/deprecadas
1. `POST http://localhost:3000/api/generate` (admin proxy)
- Estado: **deprecated**
- Headers de deprecación ya habilitados.
- Reemplazo: `POST /api/generate` vía gateway.

2. Rutas cortas directas del micro transacciones (`/crearCuenta`, etc.)
- Estado: **deprecated**
- Reemplazo: rutas oficiales bajo `/api/transacciones/transacciones/*`.
- Sunset sugerido: `2026-09-30`.

## Reglas de seguridad activas
1. Login local requiere correo verificado.
2. Admin valida rol `ADMIN` de forma case-insensitive.
3. IA usa `CORS_ORIGINS` por entorno (sin wildcard por defecto).
4. En producción, IA exige `JWT_SECRET` configurado.

## Variables de entorno mínimas recomendadas
1. `JWT_SECRET` (usuarios/admin/ia).
2. `CORS_ORIGINS` (admin/ia).
3. `USUARIOS_URL`, `CATALOGO_URL`, `NOTIFICACIONES_URL`, `AGENTE_IA_URL`.
4. `ENVIRONMENT=production` en despliegues reales.
