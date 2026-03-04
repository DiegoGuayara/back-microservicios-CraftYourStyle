Perfecto. Te dejo la documentación de endpoints vía Gateway lista para pegar en tu README.

Base URL Gateway
http://localhost:1010

Mapeo de prefijos del gateway
/api/admin -> micro admin (se reescribe a /admin)
/api/catalogo -> micro catalogo
/api/transacciones -> micro transacciones
/api/usuarios -> micro usuarios
/api/notificaciones -> micro notificaciones
/api/agente-ia -> micro agente IA
1) Admin (requiere rol ADMIN)
Header requerido:
Authorization: Bearer <JWT>

POST /api/admin/verificacionAdmin

Verifica acceso admin.
POST /api/admin/crearCategoria

Body:
{ "nombre": "Camisetas" }
POST /api/admin/crearProducto
Acepta dos formas:
Body por category_id:
{
  "nombre": "Camiseta",
  "image_url": "https://...",
  "descripcion": "Camiseta roja",
  "category_id": 1,
  "price": 10000,
  "talla": "M"
}
Body por nombre de categoría:
{
  "nombre": "Camiseta",
  "imagen": "https://...",
  "categoria": "Camisetas",
  "price": 10000
}
2) Catálogo
Categorías
POST /api/catalogo/catalogo/crearCategoria
GET /api/catalogo/catalogo/obtenerCategorias
GET /api/catalogo/catalogo/obtenerCategoria/:id
PATCH /api/catalogo/catalogo/actualizarCategoria/:id
DELETE /api/catalogo/catalogo/eliminarCategoria/:id
Productos
POST /api/catalogo/productos/crearProducto
Body:
{
  "nombre": "Camiseta",
  "image_url": "https://...",
  "descripcion": "Camiseta roja",
  "category_id": 1,
  "price": 10000,
  "talla": "M"
}
Nota: en backend se recibe como imagen_url y categoria_id.
GET /api/catalogo/productos/obtenerProductos
GET /api/catalogo/productos/obtenerProducto/:id
GET /api/catalogo/productos/obtenerProductosConDetalles/:categoria_id
PATCH /api/catalogo/productos/actualizarProducto/:id
DELETE /api/catalogo/productos/eliminarProducto/:id
Variantes
POST /api/catalogo/variantProductos/crearVariante
GET /api/catalogo/variantProductos/obtenerVariantes
GET /api/catalogo/variantProductos/obtenerVariante/:id
PATCH /api/catalogo/variantProductos/actualizarVariante/:id
DELETE /api/catalogo/variantProductos/eliminarVariante/:id
3) Transacciones
Nota: por cómo está montado, la ruta queda con doble segmento transacciones:

POST /api/transacciones/transacciones/crearCuenta
Body:
{
  "numero_de_cuenta": "123456789",
  "tipo_de_cuenta": "debito",
  "banco": "Bancolombia",
  "id_user": 1
}
GET /api/transacciones/transacciones/obtenerCuentas/:id_user
PATCH /api/transacciones/transacciones/actualizarCuenta/:id_user/:id
DELETE /api/transacciones/transacciones/eliminarCuenta/:id/:id_user
4) Usuarios
Base real en micro: /v1/usuarios, por gateway queda:

GET /api/usuarios/v1/usuarios
POST /api/usuarios/v1/usuarios (registro)
POST /api/usuarios/v1/usuarios/login
GET /api/usuarios/v1/usuarios/:id
PUT /api/usuarios/v1/usuarios?email=...
DELETE /api/usuarios/v1/usuarios/:id
GET /api/usuarios/v1/usuarios/verificar-email?token=...
POST /api/usuarios/v1/usuarios/recuperar-contrasena
POST /api/usuarios/v1/usuarios/restablecer-contrasena
POST /api/usuarios/v1/usuarios/reenviar-verificacion?email=...
5) Notificaciones
POST /api/notificaciones/
Body:
{
  "tipo_de_notificacion": "mensaje_texto",
  "mensaje": "Hola"
}
GET /api/notificaciones/
GET /api/notificaciones/health
6) Agente IA
GET /api/agente-ia/
GET /api/agente-ia/health
Chat
POST /api/agente-ia/chat/session
GET /api/agente-ia/chat/session/:sesion_id
GET /api/agente-ia/chat/session/user/:id_user
POST /api/agente-ia/chat/session/:sesion_id/close
GET /api/agente-ia/chat/session/:sesion_id/history?limit=10
POST /api/agente-ia/chat/session/:sesion_id/message
Images
POST /api/agente-ia/images/design (multipart/form-data: file, id_user, variant_id?)
POST /api/agente-ia/images/photo (multipart/form-data: file, id_user, es_principal?)
GET /api/agente-ia/images/photos/:id_user
DELETE /api/agente-ia/images/photo/:foto_id?id_user=...
Try-On
POST /api/agente-ia/tryon/generate
GET /api/agente-ia/tryon/user/:id_user
PATCH /api/agente-ia/tryon/:prueba_id/favorite?id_user=...
Observación importante
microservicios/admin/routes/factura.routes.ts está vacío, así que actualmente no hay endpoints de factura publicados.