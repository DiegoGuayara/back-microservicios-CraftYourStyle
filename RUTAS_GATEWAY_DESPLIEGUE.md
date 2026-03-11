# Rutas Publicas Del Gateway

Base del gateway desplegado:
- https://back-microservicios-craftyourstyle-v3ae.onrender.com

## Despliegues actuales
- Gateway: https://back-microservicios-craftyourstyle-v3ae.onrender.com
- Admin: https://back-microservicios-craftyourstyle-admin.onrender.com
- Notificaciones: https://back-microservicios-craftyourstyle-1.onrender.com
- Transacciones: https://back-microservicios-craftyourstyle-le6s.onrender.com
- Usuarios: https://back-microservicios-craftyourstyle-2-pvih.onrender.com

## Health y raiz
- `GET /`
  URL: `https://back-microservicios-craftyourstyle-v3ae.onrender.com/`

## Admin por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin`

Rutas:
- `POST /verificacionAdmin`
- `POST /crearCategoria`
- `POST /crearProducto`
- `GET /facturas`
- `POST /facturas/crear`
- `POST /facturas/crear-cliente`
- `GET /facturas/usuario/:id_usuario`
- `GET /facturas/:id`
- `POST /facturas/:id/enviar-correo`

URLs completas:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/verificacionAdmin`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/crearCategoria`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/crearProducto`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas/crear`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas/crear-cliente`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas/usuario/:id_usuario`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas/:id`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/admin/facturas/:id/enviar-correo`

## Notificaciones por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/notificaciones`

Rutas:
- `GET /`
- `POST /`

URLs completas:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/notificaciones/`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/notificaciones/`

Nota:
- El health actual del micro directo es `https://back-microservicios-craftyourstyle-1.onrender.com/health`

## Transacciones por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/transacciones`

Rutas principales:
- `POST /crearCuenta`
- `GET /obtenerCuentas/:id_user`
- `PATCH /actualizarCuenta/:id_user/:id`
- `DELETE /eliminarCuenta/:id/:id_user`

URLs completas:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/transacciones/crearCuenta`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/transacciones/obtenerCuentas/:id_user`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/transacciones/actualizarCuenta/:id_user/:id`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/transacciones/eliminarCuenta/:id/:id_user`

## Catalogo por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/catalogo`

Categorias:
- `POST /catalogo/crearCategoria`
- `GET /catalogo/obtenerCategorias`
- `GET /catalogo/obtenerCategoria/:id`
- `PATCH /catalogo/actualizarCategoria/:id`
- `DELETE /catalogo/eliminarCategoria/:id`

Productos:
- `POST /productos/crearProducto`
- `GET /productos/obtenerProductos`
- `GET /productos/obtenerProductosPorGenero/:genero`
- `GET /productos/obtenerProducto/:id`
- `GET /productos/obtenerProductosConDetalles/:categoria_id`
- `PATCH /productos/actualizarProducto/:id`
- `DELETE /productos/eliminarProducto/:id`

Variantes:
- `POST /variantProductos/crearVariante`
- `GET /variantProductos/obtenerVariantes`
- `GET /variantProductos/obtenerVariante/:id`
- `PATCH /variantProductos/actualizarVariante/:id`
- `DELETE /variantProductos/eliminarVariante/:id`

## Usuarios por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios`

Rutas:
- `GET /v1/usuarios`
- `POST /v1/usuarios`
- `POST /v1/usuarios/login`
- `POST /v1/usuarios/login/google`
- `POST /v1/usuarios/logout`
- `GET /v1/usuarios/me`
- `GET /v1/usuarios/:id`
- `PUT /v1/usuarios?email=:email`
- `DELETE /v1/usuarios/:id`
- `GET /v1/usuarios/verificar-email?token=:token`
- `POST /v1/usuarios/recuperar-contrasena`
- `POST /v1/usuarios/restablecer-contrasena`
- `POST /v1/usuarios/reenviar-verificacion?email=:email`

URLs completas:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/login`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/login/google`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/logout`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/me`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/:id`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/verificar-email?token=:token`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/recuperar-contrasena`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/restablecer-contrasena`
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/usuarios/v1/usuarios/reenviar-verificacion?email=:email`

## Agente IA por gateway
Base:
- `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/agente-ia`

Rutas:
- `GET /`
- `GET /health`
- `POST /chat/session`
- `GET /chat/session/:sesion_id`
- `GET /chat/session/user/:id_user`
- `POST /chat/session/:sesion_id/close`
- `GET /chat/session/:sesion_id/history`
- `POST /chat/session/:sesion_id/message`
- `POST /images/design`
- `POST /images/photo`
- `GET /images/photos/:id_user`
- `DELETE /images/photo/:foto_id?id_user=:id_user`
- `POST /tryon/generate`
- `GET /tryon/user/:id_user`
- `PATCH /tryon/:prueba_id/favorite?id_user=:id_user`

Compatibilidad legacy:
- `POST /api/generate`
  URL: `https://back-microservicios-craftyourstyle-v3ae.onrender.com/api/generate`

## Nota de consumo
- En `admin`, varias rutas requieren token de administrador.
- En `admin/facturas/crear-cliente` se usa autenticacion de usuario.
- En `usuarios`, el prefijo real del controlador es `/v1/usuarios`, por eso el gateway queda como `/api/usuarios/v1/usuarios/...`.
- En `catalogo`, el gateway conserva los prefijos internos `/catalogo`, `/productos` y `/variantProductos`.
