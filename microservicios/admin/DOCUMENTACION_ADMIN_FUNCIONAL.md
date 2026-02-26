# Documentacion Funcional - Microservicio Admin

## 1. Objetivo
Definir de forma clara que puede hacer un administrador dentro del e-commerce, bajo que reglas de seguridad y como se auditan sus acciones.

Este documento complementa la documentacion tecnica existente y se enfoca en reglas funcionales del negocio.

## 2. Alcance del Microservicio Admin
El microservicio `admin` se encarga de:
- Gestion de administradores (alta, consulta, actualizacion, baja).
- Gestion de permisos por administrador.
- Registro y consulta de auditoria administrativa.
- Validacion de si un usuario autenticado tiene privilegios administrativos.

No se encarga de:
- Login/autenticacion primaria (eso vive en `usuarios`).
- Logica interna de negocio de catalogo/pagos/transacciones (solo autoriza y orquesta acciones administrativas).

## 3. Regla de Identidad y Autenticacion
Regla principal:
- La autenticacion se resuelve en el microservicio `usuarios` (JWT/token).
- El microservicio `admin` no crea credenciales separadas ni maneja passwords.
- `admin` valida que el `id_usuario` del token exista en `administradores` y este `activo = true`.

## 4. Alta de Administradores
Politica recomendada:
- No permitir registro libre de administradores.
- Solo un `superadmin` (o proceso semilla controlado) puede crear nuevos administradores.

Estados del administrador:
- `activo = true`: puede operar.
- `activo = false`: bloqueado operativamente.

Niveles:
- `admin`: permisos operativos definidos.
- `superadmin`: puede gestionar administradores y permisos.

## 5. Modelo de Permisos (RBAC simple)
Se recomienda usar permisos granulares (no solo nivel global).

Permisos sugeridos:
- `gestionar_tiendas`
- `gestionar_productos`
- `gestionar_usuarios`
- `gestionar_transacciones`
- `ver_auditoria`
- `gestionar_administradores` (solo superadmin)

Regla:
- Un endpoint administrativo debe requerir permiso explicito.
- Si no hay permiso, debe responder `403 Forbidden`.

## 6. Matriz de Permisos Recomendada
`admin`:
- `gestionar_tiendas`
- `gestionar_productos`
- `gestionar_transacciones`
- `ver_auditoria` (opcional segun politica)

`superadmin`:
- Todos los permisos de `admin`.
- `gestionar_administradores`.
- Asignar/remover permisos a otros admins.

## 7. Reglas de Eliminacion y Cambios Criticos
Para entidades sensibles (tiendas/productos/usuarios):
- Preferir `soft delete` (`activo = false`) antes de borrado fisico.
- Hard delete solo cuando exista una justificacion de negocio clara.

Para cambios criticos:
- Registrar auditoria obligatoria.
- Guardar estado minimo del cambio en `detalle` (antes/despues cuando aplique).

## 8. Auditoria Administrativa
Toda accion administrativa debe generar un registro en `auditoria_administradores`.

Campos minimos por evento:
- `id_admin`
- `accion` (ej: `eliminar_producto`, `actualizar_tienda`)
- `entidad` (ej: `producto`, `tienda`, `usuario`)
- `id_entidad` (si aplica)
- `detalle` (JSON con contexto util)
- `ip`
- `navegador`
- `fecha_creacion`

Objetivo:
- Trazabilidad.
- Soporte a investigacion de incidentes.
- Evidencia para control interno.

## 9. Flujo Operativo Recomendado
1. Usuario inicia sesion en `usuarios`.
2. Cliente envia token a `admin`.
3. `admin` valida token y existencia en tabla `administradores`.
4. `admin` valida permiso requerido para la accion.
5. `admin` ejecuta accion (directa o por orquestacion con otros microservicios).
6. `admin` registra auditoria.
7. `admin` responde resultado.

## 10. Endpoints del Microservicio Admin (actuales)
Gestion de administradores:
- `POST /admin/crearAdmin`
- `GET /admin/obtenerAdmins`
- `GET /admin/obtenerAdmin/:id`
- `PATCH /admin/actualizarAdmin/:id`
- `DELETE /admin/eliminarAdmin/:id`

Permisos:
- `POST /admin/asignarPermiso`
- `GET /admin/obtenerPermisos/:id_admin`
- `DELETE /admin/eliminarPermiso/:id_admin/:permiso`

Auditoria:
- `POST /admin/registrarAuditoria`
- `GET /admin/obtenerAuditoria`
- `GET /admin/obtenerAuditoria/:id_admin`

## 11. Reglas HTTP Recomendadas
- `401 Unauthorized`: token ausente o invalido.
- `403 Forbidden`: autenticado pero sin permisos.
- `404 Not Found`: entidad no existe.
- `409 Conflict`: duplicados o estado inconsistente.
- `500 Internal Server Error`: error inesperado.

## 12. Checklist de Produccion
- Middleware de autenticacion JWT habilitado en rutas administrativas.
- Middleware de autorizacion por permiso en endpoints criticos.
- Auditoria automatica y obligatoria en acciones de escritura.
- Usuario semilla `superadmin` controlado (sin registro publico).
- Politica de bloqueo/desbloqueo administrativo documentada.

