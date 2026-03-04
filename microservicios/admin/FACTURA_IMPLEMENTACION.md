# Implementación del módulo de Facturas (microservicio admin)

## Qué se implementó

Se creó el módulo completo de facturas dentro de `microservicios/admin` con:

- Persistencia en MySQL.
- Endpoints HTTP para crear y consultar facturas.
- Endpoint para enviar la factura por correo (integrado con micro de notificaciones).
- Integración del router de facturas en las rutas principales de admin.

## Archivos creados/modificados

- `config/db-config.ts` (nuevo): conexión pool MySQL para facturas.
- `services/factura.services.ts`: lógica de negocio + transacciones SQL.
- `controllers/factura.controller.ts`: controladores HTTP.
- `routes/factura.routes.ts`: definición de endpoints de factura.
- `routes/admin.routes.ts`: se agrega `router.use("/facturas", facturaRoutes)`.
- `factura.sql`: ajuste de esquema para MySQL real.
- `package.json`: se agregó dependencia `mysql2`.

## Flujo implementado (según tu diagrama)

1. Usuario paga la compra (ese paso ocurre en otro micro).
2. Admin crea factura vía endpoint (`POST /admin/facturas/crear`).
3. Se guarda cabecera en `facturas` y detalle en `detalle_factura` dentro de una transacción.
4. Admin puede consultar factura por id o por usuario.
5. Admin puede disparar envío por correo con `POST /admin/facturas/:id/enviar-correo`.
6. El envío se hace llamando al micro de notificaciones (`tipo_de_notificacion = correo_electronico`).

## Endpoints disponibles

Todos protegidos con `requireAdmin` (requieren JWT con `role=ADMIN`):

- `POST /admin/facturas/crear`
- `GET /admin/facturas/usuario/:id_usuario`
- `GET /admin/facturas/:id`
- `POST /admin/facturas/:id/enviar-correo`

## Ejemplo de body para crear factura

```json
{
  "id_usuario": "123",
  "nombre_usuario": "Juan Perez",
  "correo_usuario": "juan@email.com",
  "estado": "PAGADA",
  "dias_vencimiento": 7,
  "productos": [
    {
      "nombre_producto": "Chaqueta Negra",
      "precio_unitario": 120000,
      "cantidad": 1
    },
    {
      "nombre_producto": "Pantalón Cargo",
      "precio_unitario": 90000,
      "cantidad": 2
    }
  ]
}
```

Notas:

- `subtotal` por producto es opcional; si no se envía, se calcula como `precio_unitario * cantidad`.
- `valor_total` y `total_productos` siempre se calculan en backend.

## Variables de entorno necesarias (admin)

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (por defecto: `factura`)
- `NOTIFICACIONES_URL` (por defecto: `http://notificaciones:10104`)
- `JWT_SECRET` (ya usado por `requireAdmin`)

## Ajuste SQL importante

Se cambió el esquema para compatibilidad con MySQL:

- `id` de factura: `CHAR(36)` (UUID en formato string).
- `id_factura` de detalle: `CHAR(36)` con FK a `facturas(id)`.

Esto evita errores por usar `UUID` como tipo nativo (no soportado de esa forma en MySQL).

## Pendiente recomendado

Si quieres automatizar completamente el diagrama, el siguiente paso es crear factura al confirmar pago (evento o webhook) para que no dependa de crearla manualmente desde admin.
