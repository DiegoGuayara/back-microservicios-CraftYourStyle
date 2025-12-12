# Documentación del Microservicio de Catálogo - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Entidades](#entidades)
4. [API Endpoints](#api-endpoints)
5. [Métodos Detallados](#métodos-detallados)

---

## Descripción General

El microservicio de catálogo maneja toda la gestión del catálogo de productos de CraftYourStyle:
- **Productos** y sus detalles
- **Categorías** para clasificar productos
- **Variantes** de productos (tallas, colores, stock, precios)
- **Tiendas** que ofrecen los productos

**Puerto:** 10103  
**Base de datos:** CraftYourStyle_Catalogo (MySQL)

---

## Estructura del Proyecto

```
catalogo/
├── index.ts                    # Punto de entrada del microservicio
├── config/
│   └── db-config.ts           # Configuración de conexión a BD
├── DTO/
│   ├── productosDto.ts        # Definición de datos de productos
│   ├── categoriaDto.ts        # Definición de datos de categorías
│   ├── tiendaDto.ts          # Definición de datos de tiendas
│   └── variant-productos.ts   # Definición de datos de variantes
├── repository/
│   ├── productos.repository.ts
│   ├── categoria.repository.ts
│   ├── tienda.repository.ts
│   └── variant-productos.repository.ts
├── controllers/
│   ├── productos.controller.ts
│   ├── catalogo.controller.ts
│   ├── tienda.controller.ts
│   └── variant-producto.controller.ts
└── routes/
    ├── productos.routes.ts
    ├── catalogo.routes.ts
    ├── tienda.routes.ts
    └── variant-producto.routes.ts
```

---

## Entidades

### Productos
- **id**: Identificador único
- **name**: Nombre del producto
- **description**: Descripción detallada
- **imagen**: URL de la imagen
- **category_id**: ID de la categoría a la que pertenece
- **tienda_id**: ID de la tienda dueña del producto
- **created_at**: Fecha de creación (auto-generado)
- **updated_at**: Fecha de actualización (auto-generado)

### Categorías
- **id**: Identificador único
- **name**: Nombre de la categoría
- **tienda_id**: ID de la tienda

### Tiendas
- **id**: Identificador único
- **nombre**: Nombre de la tienda

### Variantes de Productos
- **id**: Identificador único
- **producto_id**: ID del producto al que pertenece
- **size**: Talla (ej: S, M, L, XL, o medidas)
- **color**: Color de la variante
- **stock**: Cantidad disponible
- **price**: Precio de esta variante específica

---

## API Endpoints

### Productos - Base: `/productos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/crearProducto` | Crea un nuevo producto |
| GET | `/obtenerProductos` | Obtiene todos los productos |
| GET | `/obtenerProducto/:id` | Obtiene un producto por ID |
| GET | `/obtenerProductosConDetalles/:tienda_id/:category_id` | Obtiene productos con detalles completos filtrados |
| GET | `/obtenerProductosPorTienda/:tienda_id` | Obtiene todos los productos de una tienda |
| PATCH | `/actualizarProducto/:id` | Actualiza un producto |
| DELETE | `/eliminarProducto/:id` | Elimina un producto |

### Categorías - Base: `/catalogo`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/crearCategoria` | Crea una nueva categoría |
| GET | `/obtenerCategorias` | Obtiene todas las categorías |
| GET | `/obtenerCategoria/:id` | Obtiene una categoría por ID |
| PATCH | `/actualizarCategoria/:id` | Actualiza una categoría |
| DELETE | `/eliminarCategoria/:id` | Elimina una categoría |

### Tiendas - Base: `/tienda`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/crearTienda` | Crea una nueva tienda |
| GET | `/obtenerTiendas` | Obtiene todas las tiendas |
| GET | `/obtenerTienda/:id` | Obtiene una tienda por ID |
| PATCH | `/actualizarTienda/:id` | Actualiza una tienda |
| DELETE | `/eliminarTienda/:id` | Elimina una tienda |

### Variantes - Base: `/variantProductos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/crearVarianteProducto` | Crea una nueva variante |
| GET | `/obtenerVariantes` | Obtiene todas las variantes |
| GET | `/obtenerVariante/:id` | Obtiene una variante por ID |
| PATCH | `/actualizarVariante/:id` | Actualiza una variante |
| DELETE | `/eliminarVariante/:id` | Elimina una variante |

---

## Métodos Detallados

### PRODUCTOS

#### 1. Crear Producto
**Endpoint:** `POST /productos/crearProducto`

**Body esperado:**
```json
{
  "nombre": "Collar Artesanal",
  "descripcion": "Collar hecho a mano con piedras naturales",
  "imagen": "https://ejemplo.com/imagenes/collar.jpg",
  "category_id": 1,
  "tienda_id": 1
}
```

**Respuestas:**
- **201**: `{message: "Producto creado", id: insertId}`
- **400**: Faltan datos obligatorios
- **500**: Error del servidor

**Notas:**
- Los campos `created_at` y `updated_at` se generan automáticamente
- Todos los campos son obligatorios excepto las fechas

---

#### 2. Obtener Todos los Productos
**Endpoint:** `GET /productos/obtenerProductos`

**Respuesta exitosa (200):**
```json
{
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "name": "Collar Artesanal",
      "description": "...",
      "imagen": "...",
      "category_id": 1,
      "tienda_id": 1,
      "created_at": "2025-12-12...",
      "updated_at": "2025-12-12..."
    }
  ]
}
```

**Notas:**
- Retorna solo datos básicos de la tabla productos
- NO incluye nombres de categorías, tiendas ni variantes
- Para información completa usar `obtenerProductosConDetalles` o `obtenerProductosPorTienda`

---

#### 3. Obtener Producto por ID
**Endpoint:** `GET /productos/obtenerProducto/:id`

**Ejemplo:** `GET /productos/obtenerProducto/1`

**Respuestas:**
- **200**: Producto encontrado
- **404**: Producto no encontrado
- **500**: Error del servidor

---

#### 4. Obtener Productos con Detalles (JOIN)
**Endpoint:** `GET /productos/obtenerProductosConDetalles/:tienda_id/:category_id`

**Ejemplo:** `GET /productos/obtenerProductosConDetalles/1/2`

**Descripción:**
Obtiene productos filtrados por tienda Y categoría, incluyendo:
- Información completa del producto
- Nombre de la categoría
- Nombre de la tienda
- **TODAS las variantes** (tallas, colores, stock, precios)

**Respuesta exitosa (200):**
```json
{
  "message": "Productos con detalles obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "producto": "Collar Artesanal",
      "descripcion": "Collar hecho a mano...",
      "imagen": "https://...",
      "category_id": 1,
      "tienda_id": 1,
      "categoria": "Accesorios",
      "tienda": "Artesanías Luna",
      "variante_id": 1,
      "talla": "Único",
      "color": "Turquesa",
      "stock": 15,
      "precio": 45000.00,
      "created_at": "2025-12-12...",
      "updated_at": "2025-12-12..."
    },
    {
      "id": 1,
      "producto": "Collar Artesanal",
      "descripcion": "Collar hecho a mano...",
      "imagen": "https://...",
      "category_id": 1,
      "tienda_id": 1,
      "categoria": "Accesorios",
      "tienda": "Artesanías Luna",
      "variante_id": 2,
      "talla": "Único",
      "color": "Rojo",
      "stock": 10,
      "precio": 45000.00,
      "created_at": "2025-12-12...",
      "updated_at": "2025-12-12..."
    }
  ]
}
```

**Notas importantes:**
- Si un producto tiene múltiples variantes, aparece una fila por cada variante
- Usa LEFT JOIN para variantes, así muestra productos aunque no tengan variantes
- Requiere ambos parámetros: tienda_id y category_id

**Caso de uso:**
Mostrar productos de una categoría específica dentro de una tienda (ej: ver todos los accesorios de "Artesanías Luna")

**Query SQL ejecutado:**
```sql
SELECT
    p.id,
    p.name AS producto,
    p.description AS descripcion,
    p.imagen,
    p.category_id,
    p.tienda_id,
    c.name AS categoria,
    t.nombre AS tienda,
    vp.id AS variante_id,
    vp.size AS talla,
    vp.color,
    vp.stock,
    vp.price AS precio,
    p.created_at,
    p.updated_at
FROM productos p
JOIN categoria c ON p.category_id = c.id
JOIN tienda t ON p.tienda_id = t.id
LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
WHERE p.tienda_id = ? AND p.category_id = ?
```

---

#### 5. Obtener Productos por Tienda (JOIN)
**Endpoint:** `GET /productos/obtenerProductosPorTienda/:tienda_id`

**Ejemplo:** `GET /productos/obtenerProductosPorTienda/1`

**Descripción:**
Obtiene TODOS los productos de una tienda específica (sin filtrar por categoría):
- Información completa del producto
- Nombre de la categoría
- Nombre de la tienda
- NO incluye variantes

**Respuesta exitosa (200):**
```json
{
  "message": "Productos obtenidos correctamente",
  "data": [
    {
      "id": 1,
      "producto": "Collar Artesanal",
      "descripcion": "...",
      "imagen": "...",
      "category_id": 1,
      "tienda_id": 1,
      "categoria": "Accesorios",
      "tienda": "Artesanías Luna",
      "created_at": "2025-12-12...",
      "updated_at": "2025-12-12..."
    },
    {
      "id": 2,
      "producto": "Blusa Bordada",
      "descripcion": "...",
      "imagen": "...",
      "category_id": 2,
      "tienda_id": 1,
      "categoria": "Ropa",
      "tienda": "Artesanías Luna",
      "created_at": "2025-12-12...",
      "updated_at": "2025-12-12..."
    }
  ]
}
```

**Notas importantes:**
- Retorna todos los productos de todas las categorías de la tienda
- NO incluye variantes de productos
- Solo requiere tienda_id

**Caso de uso:**
Mostrar el catálogo completo de una tienda sin filtros

**Query SQL ejecutado:**
```sql
SELECT
    p.id,
    p.name AS producto,
    p.description AS descripcion,
    p.imagen,
    p.category_id,
    p.tienda_id,
    c.name AS categoria,
    t.nombre AS tienda,
    p.created_at,
    p.updated_at
FROM productos p
JOIN categoria c ON p.category_id = c.id
JOIN tienda t ON p.tienda_id = t.id
WHERE p.tienda_id = ?
```

---

#### 6. Actualizar Producto
**Endpoint:** `PATCH /productos/actualizarProducto/:id`

**Ejemplo:** `PATCH /productos/actualizarProducto/1`

**Body (solo los campos a actualizar):**
```json
{
  "nombre": "Nuevo nombre del producto"
}
```

O múltiples campos:
```json
{
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripción",
  "imagen": "https://nueva-url.com/imagen.jpg"
}
```

**Respuestas:**
- **200**: Producto actualizado
- **404**: Producto no encontrado
- **500**: Error del servidor

**Notas:**
- Método dinámico: solo actualiza los campos enviados
- No es necesario enviar todos los campos

---

#### 7. Eliminar Producto
**Endpoint:** `DELETE /productos/eliminarProducto/:id`

**Ejemplo:** `DELETE /productos/eliminarProducto/1`

**Respuestas:**
- **200**: Producto eliminado
- **404**: Producto no encontrado
- **500**: Error del servidor

**Notas:**
- Si el producto tiene variantes asociadas, también se eliminarán (si hay CASCADE en la BD)

---

### CATEGORÍAS

#### 1. Crear Categoría
**Endpoint:** `POST /catalogo/crearCategoria`

**Body:**
```json
{
  "name": "Accesorios"
}
```

**Respuestas:**
- **201**: Categoría creada
- **400**: Faltan datos obligatorios
- **500**: Error del servidor

---

#### 2. Obtener Todas las Categorías
**Endpoint:** `GET /catalogo/obtenerCategorias`

**Respuesta exitosa (200):**
```json
{
  "message": "Categorias obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "name": "Accesorios"
    },
    {
      "id": 2,
      "name": "Ropa"
    }
  ]
}
```

---

#### 3. Obtener Categoría por ID
**Endpoint:** `GET /catalogo/obtenerCategoria/:id`

**Respuestas:**
- **200**: Categoría encontrada
- **404**: Categoría no encontrada
- **500**: Error del servidor

---

#### 4. Actualizar Categoría
**Endpoint:** `PATCH /catalogo/actualizarCategoria/:id`

**Body:**
```json
{
  "name": "Nuevo nombre de categoría"
}
```

**Respuestas:**
- **200**: Categoría actualizada
- **400**: Faltan datos
- **404**: Categoría no encontrada
- **500**: Error del servidor

---

#### 5. Eliminar Categoría
**Endpoint:** `DELETE /catalogo/eliminarCategoria/:id`

**Respuestas:**
- **200**: Categoría eliminada
- **404**: Categoría no encontrada
- **500**: Error del servidor

---

### TIENDAS

#### 1. Crear Tienda
**Endpoint:** `POST /tienda/crearTienda`

**Body:**
```json
{
  "nombre": "Artesanías Luna"
}
```

**Respuestas:**
- **201**: Tienda creada
- **400**: Faltan datos obligatorios
- **500**: Error del servidor

---

#### 2. Obtener Todas las Tiendas
**Endpoint:** `GET /tienda/obtenerTiendas`

**Respuesta exitosa (200):**
```json
{
  "message": "Tiendas obtenidas correctamente",
  "data": [
    {
      "id": 1,
      "nombre": "Artesanías Luna"
    },
    {
      "id": 2,
      "nombre": "Creaciones Sol"
    }
  ]
}
```

---

#### 3-5. Obtener, Actualizar y Eliminar Tienda
Similar a las operaciones de categorías, usando los endpoints correspondientes.

---

### VARIANTES DE PRODUCTOS

#### 1. Crear Variante
**Endpoint:** `POST /variantProductos/crearVarianteProducto`

**Body:**
```json
{
  "producto_id": 1,
  "size": "M",
  "color": "Azul",
  "stock": 20,
  "price": 45000.00
}
```

**Respuestas:**
- **201**: Variante creada
- **400**: Faltan datos obligatorios
- **500**: Error del servidor

**Notas:**
- Todos los campos son obligatorios
- `stock` y `price` pueden ser 0 pero deben estar presentes

---

#### 2. Obtener Todas las Variantes
**Endpoint:** `GET /variantProductos/obtenerVariantes`

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Variantes obtenidas",
  "data": [
    {
      "id": 1,
      "producto_id": 1,
      "size": "M",
      "color": "Azul",
      "stock": 20,
      "price": 45000.00
    }
  ]
}
```

---

#### 3. Obtener Variante por ID
**Endpoint:** `GET /variantProductos/obtenerVariante/:id`

**Respuestas:**
- **200**: Variante encontrada
- **404**: Variante no encontrada
- **500**: Error del servidor

---

#### 4. Actualizar Variante
**Endpoint:** `PATCH /variantProductos/actualizarVariante/:id`

**Body (solo campos a actualizar):**
```json
{
  "stock": 30,
  "price": 48000.00
}
```

**Respuestas:**
- **200**: Variante actualizada
- **400**: No se enviaron datos para actualizar
- **404**: Variante no encontrada
- **500**: Error del servidor

**Notas:**
- Actualización dinámica: solo se modifican los campos enviados
- Útil para actualizar stock sin cambiar otros datos

---

#### 5. Eliminar Variante
**Endpoint:** `DELETE /variantProductos/eliminarVariante/:id`

**Respuestas:**
- **200**: Variante eliminada
- **404**: Variante no encontrada
- **500**: Error del servidor

---

## Diferencias entre Métodos de Obtención de Productos

| Método | Filtra por | Incluye Variantes | Usa cuando... |
|--------|------------|-------------------|---------------|
| `obtenerProductos()` | Nada | ❌ No | Necesitas un listado simple de todos los productos |
| `obtenerProductoPorId()` | ID producto | ❌ No | Buscas un producto específico |
| `obtenerProductosConDetalles()` | Tienda + Categoría | ✅ Sí | Quieres ver productos de una categoría específica con sus variantes |
| `obtenerProductosPorTienda()` | Tienda | ❌ No | Quieres ver todo el catálogo de una tienda |

---

## Arquitectura del Código

### Flujo de una petición:
```
Cliente HTTP Request
    ↓
Routes (valida ruta y método)
    ↓
Controller (valida datos, maneja errores)
    ↓
Repository (ejecuta query en BD)
    ↓
Base de Datos
    ↓
← Respuesta en sentido inverso
```

### Capas:
1. **Routes**: Define las rutas HTTP y las asocia con métodos del controller
2. **Controller**: Valida los datos de entrada y maneja la lógica de negocio
3. **Repository**: Ejecuta las queries SQL en la base de datos
4. **DTO**: Define la estructura de datos que se transfieren entre capas

---

## Códigos de Estado HTTP Usados

- **200 OK**: Operación exitosa (GET, PATCH, DELETE)
- **201 Created**: Recurso creado exitosamente (POST)
- **400 Bad Request**: Faltan datos obligatorios o datos inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor o base de datos

---

## Base de Datos

### Relaciones:
- **productos** pertenece a **categoria** (category_id)
- **productos** pertenece a **tienda** (tienda_id)
- **variantes_productos** pertenece a **productos** (producto_id)
- **categoria** pertenece a **tienda** (tienda_id)

### Campos auto-generados:
- `created_at`: Se genera automáticamente al crear un registro
- `updated_at`: Se actualiza automáticamente al modificar un registro

---

## Notas para la Exposición

### Puntos clave a mencionar:

1. **Arquitectura en capas**: Separación clara de responsabilidades (Routes → Controller → Repository)

2. **Operaciones CRUD completas** en todas las entidades

3. **JOINs importantes**:
   - `obtenerProductosConDetalles`: Combina 4 tablas (productos, categoria, tienda, variantes_productos)
   - `obtenerProductosPorTienda`: Combina 3 tablas (productos, categoria, tienda)

4. **Validaciones**: Todos los controllers validan datos antes de llamar al repository

5. **Manejo de errores**: Try-catch en todos los métodos con códigos HTTP apropiados

6. **Métodos dinámicos**: Las actualizaciones solo modifican los campos enviados

7. **Escalabilidad**: La estructura permite agregar fácilmente nuevas funcionalidades

---

## Ejemplos de Uso Completo

### Flujo típico:

1. **Crear una tienda**
```
POST /tienda/crearTienda
Body: {"nombre": "Artesanías Luna"}
→ Retorna: {"message": "Tienda creada", "data": {insertId: 1}}
```

2. **Crear una categoría para esa tienda**
```
POST /catalogo/crearCategoria
Body: {"name": "Accesorios"}
→ Retorna: {"message": "Categoria creada exitosamente", "data": {insertId: 1}}
```

3. **Crear un producto**
```
POST /productos/crearProducto
Body: {
  "nombre": "Collar Artesanal",
  "descripcion": "Collar hecho a mano...",
  "imagen": "https://...",
  "category_id": 1,
  "tienda_id": 1
}
→ Retorna: {"message": "Producto creado", "id": {insertId: 1}}
```

4. **Agregar variantes al producto**
```
POST /variantProductos/crearVarianteProducto
Body: {
  "producto_id": 1,
  "size": "Único",
  "color": "Turquesa",
  "stock": 15,
  "price": 45000.00
}
→ Retorna: {"mensaje": "Variante creada", "data": {...}}
```

5. **Consultar productos con detalles**
```
GET /productos/obtenerProductosConDetalles/1/1
→ Retorna: Lista completa con producto, categoría, tienda y todas sus variantes
```

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Microservicio:** Catálogo - CraftYourStyle  
**Puerto:** 10103  
**Versión:** 1.0
