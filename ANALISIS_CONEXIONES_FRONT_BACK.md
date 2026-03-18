# Diagnóstico de Conexión Front-Back (CraftYourStyle)

## 1) Alcance y método
Este diagnóstico compara los contratos **reales** entre:
- Frontend React + TypeScript (`Proyecto-Formativo-Cliente`).
- Backend por microservicios + gateway (`back-microservicios-CraftYourStyle`).

Se revisaron:
- Tipos/interfaces del front (`src/types`, `src/data`, componentes admin).
- DTOs, rutas, controladores y servicios del back.
- Enrutamiento del gateway y configuración CORS/base URLs.

## 2) Mapa rápido de integración actual
- Front hoy consume directamente:
  - Auth: `http://localhost:1010/api/usuarios/v1/usuarios` (gateway).
  - IA (personalización): `http://localhost:3000/api/generate` (servicio no alineado con micro de IA actual).
- Back está expuesto principalmente detrás de gateway (`:1010`) con prefijos:
  - `/api/usuarios`, `/api/catalogo`, `/api/transacciones`, `/api/admin`, `/api/notificaciones`, `/api/agente-ia`.

## 3) Desfases de interfaces y tipos (Front vs Back)

### 3.1 Auth (alto impacto)
1. **`/me` no existe en usuarios**
- Front llama `GET /me` en `auth.service.ts`.
- En `UserController` no existe endpoint `/me`.
- Riesgo: error 404 al intentar restaurar/validar sesión remota.

2. **Tipo `User` del front no coincide 1:1 con respuesta backend**
- Front espera `{ id: string, name: string, role: "user"|"admin" }`.
- Backend login normal retorna principalmente `token`, `id`, `usuario` (email), `role`.
- Backend login Google sí incluye `nombre` adicional.
- Hay normalización defensiva en front, pero no hay contrato estable explícito.

3. **Registro no entrega el mismo shape que login**
- Front `register()` espera poder construir sesión de usuario inmediata.
- Backend `crearUsuario` retorna `Usuario` (objeto) + `message`, y además el login exige credenciales.
- Riesgo: inconsistencias al autologuear tras registro.

4. **Role casing distinto entre servicios**
- Usuarios maneja `USER/ADMIN` en backend.
- Front usa `user/admin` (minúsculas) y transforma.
- Admin middleware exige exactamente `payload.role === "ADMIN"`.
- Riesgo: si token/claim llega en minúscula, admin falla con 403.

### 3.2 Catálogo y productos (alto impacto)
1. **Categoría front vs back completamente distinta**
- Front `Categoria`: `{ title, description, image, path }`.
- Back `CategoriaDto`: `{ id?, nombre }`.
- No hay mapping definido en front para convertir backend -> vista.

2. **Producto front vs back con nomenclatura distinta**
- Front (catálogo público): `{ id, nombre, precio, imagen, categoria, descripcion }`.
- Back productos: `{ id, nombre, imagen_url, descripcion, categoria_id, price, talla }`.
- Front admin tabla usa otro contrato distinto: `{ id, name, category, price, stock, image }`.
- Riesgo: triple contrato de producto dentro del front + contrato backend diferente.

3. **Categorías enumeradas incompatibles**
- Front admin: `"men_clothing" | "women_clothing" | "hats"`.
- Back trabaja por `categoria_id` (numérico) o `nombre` en español.
- Riesgo: choques de mapeo al crear/editar producto.

### 3.3 Pedidos/Facturas (alto impacto)
1. **Estado de pedido no coincide**
- Front admin pedidos: `"confirmado" | "enviado" | "pendiente"`.
- Back factura: `"PENDIENTE" | "PAGADA" | "VENCIDA"`.
- Riesgo: filtros, badges, lógica de actualización y traducción de estados rota.

2. **Modelo de pedido del front no coincide con factura back**
- Front order: `{ id, customerName, customerEmail, date, items, total, status }`.
- Back factura: `{ id, id_usuario, nombre_usuario, correo_usuario, productos[], total_productos, valor_total, fecha_emision, fecha_vencimiento, estado }`.
- Requiere adapter obligatorio.

3. **Tipo `src/types/invoice.ts` en front no representa factura real**
- Sólo define `Product { id, name, price }`.
- Backend maneja estructura de factura y detalle mucho más amplia.

### 3.4 Transacciones
1. **Ruta final con doble segmento**
- Gateway expone `/api/transacciones`.
- Micro monta `app.use("/transacciones", router)`.
- Resultado real: `/api/transacciones/transacciones/...`.
- Riesgo: llamadas intuitivas a `/api/transacciones/...` fallan si no se considera el doble prefijo.

2. **`id_user` numérico en DTO backend**
- Front maneja `user.id` como string.
- Riesgo: casting y validación inconsistente en payloads.

### 3.5 IA / personalización (crítico)
1. **Front llama endpoint que no corresponde al microservicio IA actual**
- Front: `POST http://localhost:3000/api/generate` con JSON `{ image, prompt, aspectRatio, creativity }`.
- Back IA real (gateway): rutas `/api/agente-ia/chat/*`, `/api/agente-ia/images/*`, `/api/agente-ia/tryon/*`.
- No existe `/api/generate` en esta arquitectura.
- Riesgo: integración de personalización totalmente bloqueada en runtime.

2. **Formato esperado de IA diferente (multipart/form-data y schemas propios)**
- Endpoints de imágenes usan `UploadFile` + `FormData`.
- Front actual manda JSON para generación.
- Riesgo: 400/422 por contrato de content-type/payload.

## 4) Puntos críticos de conexión y conflictos probables

### 4.1 Críticos (deben resolverse primero)
1. Definir un contrato único de `UserSession` (login/register/google/me) y su envelope (`data`, `message`, etc.).
2. Definir contrato único de `Producto` y `Categoria` para:
- catálogo público,
- carrito,
- admin.
3. Definir adapter de `Factura -> PedidoUI` y `PedidoUI -> acciones backend`.
4. Corregir estrategia IA: usar gateway `/api/agente-ia/*` o crear un BFF que mantenga `/api/generate`.
5. Acordar convención global de estados (`PENDIENTE/PAGADA/VENCIDA` vs labels UI).

### 4.2 Riesgos técnicos altos
1. **CORS admin restringido**: admin service permite origen `http://localhost:5173` y un dominio Vercel específico; otros orígenes fallarán.
2. **JWT secret y claim role**: admin requiere `JWT_SECRET` y role exacto `ADMIN`.
3. **Timeouts**: front auth usa timeout 5s; operaciones con correos/servicios encadenados pueden excederlo.
4. **Dependencias entre micros**: facturas depende de usuarios + notificaciones; falla en cadena afecta UX.
5. **Nombres de campos mixtos ES/EN** (`nombre`/`name`, `imagen_url`/`image`, `categoria_id`/`category_id`).

### 4.3 Riesgos de calidad de datos
1. IDs en front de productos actualmente duplicados en mocks (`src/data/Productos.ts`), riesgo para llaves y sincronización.
2. Tipos locales hardcodeados en admin (`ProductsTable`, `PedidosTable`) no representan backend actual.
3. Ausencia de versionado de contrato (no hay OpenAPI/SDK compartido visible).

## 5) Lista completa de lo que debes tener en cuenta para conectar exitosamente

### 5.1 Contrato y tipos
1. Definir un **source of truth** de contratos (OpenAPI o paquete `shared-types`).
2. Establecer naming único (recomendado snake_case en API o camelCase + mappers explícitos).
3. Congelar envelopes de respuesta (ejemplo: `{ message, data, error }`).
4. Tipar errores de API (shape único para `message`, `details`, `errors`).
5. Normalizar tipos de ID (`number` o `string`) por dominio.
6. Estandarizar enums (`role`, `status`, `tipo_de_cuenta`, etc.).

### 5.2 Endpoints y ruteo
1. Publicar tabla canónica de rutas gateway finales (incluyendo doble prefijo en transacciones).
2. Evitar consumo directo a puertos internos (`3000`, `8080`, etc.) desde front; priorizar gateway.
3. Confirmar si existirá `/me`; si no, eliminar su uso del front.
4. Documentar rutas protegidas por admin y sus precondiciones de JWT.

### 5.3 Seguridad y autenticación
1. Alinear claim `role` y casing (`ADMIN`/`USER`).
2. Definir política de expiración/revocación de token y refresh si aplica.
3. Validar logout centralizado y comportamiento si backend no responde.
4. Revisar CORS por entorno (local, staging, prod) en cada micro.

### 5.4 Transformación de datos en front
1. Implementar capa de adapters por dominio:
- `auth.adapter.ts`
- `catalog.adapter.ts`
- `factura.adapter.ts`
- `ia.adapter.ts`
2. No mezclar tipos UI con tipos API: mantener `ApiXxx` separado de `UiXxx`.
3. Eliminar mocks progresivamente con feature flags o repositorios falsos tipados.

### 5.5 Resiliencia operativa
1. Manejar explícitamente 401/403/404/409/422/500 con UX específica.
2. Instrumentar logging de request-id/correlation-id entre gateway y micros.
3. Añadir retries controlados solo donde sea idempotente (GET, no en POST sensibles).
4. Definir timeouts por tipo de operación (auth, catálogo, facturas, IA).

### 5.6 Testing mínimo para salida segura
1. Contract tests para auth, catálogo, factura y transacciones.
2. E2E de flujos críticos:
- registro + login,
- listar catálogo,
- crear producto admin,
- crear factura y notificación,
- flujo IA principal.
3. Tests de regresión de mappers (JSON fixture -> tipo UI).

## 6) Priorización recomendada para comenzar integraciones
1. **Auth + sesión** (base para rutas protegidas y admin).
2. **Catálogo público** (categorías/productos).
3. **Admin productos/categorías**.
4. **Facturas/pedidos**.
5. **Transacciones**.
6. **IA/personalización** (requiere redefinir contrato de endpoint).

## 7) Evidencia técnica (archivos clave revisados)
- Front auth/service:
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/services/auth.service.ts`
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/types/auth.types.ts`
- Front IA:
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/services/nanoService.ts`
- Front tipos UI/admin:
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/types/categoria.types.ts`
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/types/invoice.ts`
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/components/admin/table/ProductsTable.tsx`
  - `Proyecto-Formativo-Cliente/Proyecto-Formativo-Cliente/src/components/admin/table/PedidosTable.tsx`
- Gateway:
  - `back-microservicios-CraftYourStyle/microservicios/gateway/index.ts`
- Usuarios:
  - `back-microservicios-CraftYourStyle/microservicios/usuarios/src/main/java/com/example/CraftYourStyle2/controllers/UserController.java`
  - `back-microservicios-CraftYourStyle/microservicios/usuarios/src/main/java/com/example/CraftYourStyle2/services/UserServices.java`
  - `back-microservicios-CraftYourStyle/microservicios/usuarios/src/main/java/com/example/CraftYourStyle2/dto/*.java`
- Catálogo:
  - `back-microservicios-CraftYourStyle/microservicios/catalogo/DTO/*.ts`
  - `back-microservicios-CraftYourStyle/microservicios/catalogo/controllers/*.ts`
  - `back-microservicios-CraftYourStyle/microservicios/catalogo/routes/*.ts`
- Admin/facturas:
  - `back-microservicios-CraftYourStyle/microservicios/admin/models/factura.models.ts`
  - `back-microservicios-CraftYourStyle/microservicios/admin/services/factura.services.ts`
  - `back-microservicios-CraftYourStyle/microservicios/admin/middlewares/admin.middleware.ts`
- Transacciones:
  - `back-microservicios-CraftYourStyle/microservicios/transacciones/index.ts`
  - `back-microservicios-CraftYourStyle/microservicios/transacciones/routes/transaccionesRoutes.ts`
- IA:
  - `back-microservicios-CraftYourStyle/microservicios/agente IA/app/main.py`
  - `back-microservicios-CraftYourStyle/microservicios/agente IA/app/routes/*.py`

---

## Resumen ejecutivo
Hoy el principal riesgo no es sólo "conectar endpoints", sino la **falta de contrato unificado** entre tipos UI y tipos API (auth, catálogo, pedidos e IA). Si primero unificas contratos (y adapters), las conexiones serán estables; si conectas directo con los tipos actuales, lo más probable es que aparezcan errores de shape, estados y rutas desde el primer sprint.

