# Documentación del Microservicio de Personalización - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Modelo de Datos](#modelo-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Métodos Detallados](#métodos-detallados)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Casos de Uso](#casos-de-uso)

---

## Descripción General

El microservicio de personalización permite a los usuarios personalizar productos con:
- **Colores** personalizados (código hexadecimal)
- **Imágenes** (URL de imagen)
- **Textos** personalizados
- **Tipo de letra** (fuente tipográfica)
- Asociación con **variantes de productos** específicas

**Tecnología:** TypeScript + Express + MySQL  
**Puerto:** 10102  
**Base de datos:** CraftYourStyle_Personalizacion

---

## Estructura del Proyecto

```
personalizacion/
├── index.ts                          # Punto de entrada del microservicio
├── config/
│   └── db-config.ts                 # Configuración de conexión a BD
├── DTO/
│   └── personalizacionDto.ts        # Definición de datos de personalización
├── repository/
│   └── personalizacion.repository.ts # Operaciones de base de datos
├── controllers/
│   └── personalizacion.controller.ts # Lógica de peticiones HTTP
├── routes/
│   └── personalizacion.routes.ts    # Definición de rutas
├── CraftYourStyle-Personalizacion.sql # Script de creación de BD
└── package.json                      # Dependencias del proyecto
```

---

## Modelo de Datos

### Tabla: personalizacion

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| **id** | INT (PK, AUTO_INCREMENT) | Identificador único | 1 |
| **color** | VARCHAR(7) | Código hexadecimal del color | "#FF5733" |
| **image_url** | VARCHAR(255) | URL de la imagen personalizada | "https://ejemplo.com/img.jpg" |
| **textos** | VARCHAR(100) | Texto a agregar al producto | "Mi nombre" |
| **tipo_letra** | VARCHAR(100) | Fuente tipográfica | "Arial", "Verdana" |
| **variant_id** | INT (nullable) | ID de la variante de producto | 1, NULL |

### Tabla: imagenes (adicional)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **id** | INT (PK, AUTO_INCREMENT) | Identificador único |
| **image_url** | VARCHAR(255) | URL de la imagen |
| **variant_id** | INT (nullable) | ID de la variante |

**Nota:** La tabla `imagenes` está disponible para almacenar múltiples imágenes por variante.

---

## API Endpoints

### Base URL
```
http://localhost:10102/personalizacion
```

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/obtenerPersonalizacion` | Obtiene todas las personalizaciones |
| POST | `/crearPersonalizacion` | Crea una nueva personalización |
| GET | `/obtenerPersonalizacion/:id` | Obtiene una personalización por ID |
| PATCH | `/actualizarPersonalizacion/:id` | Actualiza una personalización |
| DELETE | `/eliminarPersonalizacion/:id` | Elimina una personalización |

---

## Métodos Detallados

### 1. Crear Personalización

**Endpoint:** `POST /personalizacion/crearPersonalizacion`

**Descripción:**  
Crea una nueva personalización para un producto.

**Body esperado:**
```json
{
  "color": "#FF5733",
  "image_url": "https://ejemplo.com/mi-imagen.jpg",
  "textos": "Juan Pérez",
  "tipo_letra": "Arial",
  "variant_id": 1
}
```

**Campos:**
- **color** (obligatorio): Código hexadecimal del color (7 caracteres incluyendo #)
- **image_url** (obligatorio): URL de la imagen personalizada
- **textos** (obligatorio): Texto que se agregará al producto (máx. 100 caracteres)
- **tipo_letra** (obligatorio): Fuente tipográfica a utilizar
- **variant_id** (opcional): ID de la variante de producto a personalizar

**Respuesta exitosa (201):**
```json
{
  "message": "Personalización creada",
  "id": {
    "insertId": 1,
    "affectedRows": 1
  }
}
```

**Respuestas de error:**
- **400**: Faltan datos obligatorios
```json
{
  "message": "Faltan datos obligatorios"
}
```

- **500**: Error del servidor
```json
{
  "message": "Error al crear la personalización",
  "error": "..."
}
```

---

### 2. Obtener Todas las Personalizaciones

**Endpoint:** `GET /personalizacion/obtenerPersonalizacion`

**Descripción:**  
Obtiene todas las personalizaciones registradas en el sistema.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "color": "#FF5733",
    "image_url": "https://ejemplo.com/imagen1.jpg",
    "textos": "Juan Pérez",
    "tipo_letra": "Arial",
    "variant_id": 1
  },
  {
    "id": 2,
    "color": "#00FF00",
    "image_url": "https://ejemplo.com/imagen2.jpg",
    "textos": "María García",
    "tipo_letra": "Verdana",
    "variant_id": 2
  }
]
```

**Si no hay personalizaciones:**
```json
[]
```

---

### 3. Obtener Personalización por ID

**Endpoint:** `GET /personalizacion/obtenerPersonalizacion/:id`

**Ejemplo:** `GET /personalizacion/obtenerPersonalizacion/1`

**Respuesta exitosa (200):**
```json
{
  "message": "Personalización obtenida correctamente",
  "data": {
    "id": 1,
    "color": "#FF5733",
    "image_url": "https://ejemplo.com/imagen.jpg",
    "textos": "Juan Pérez",
    "tipo_letra": "Arial",
    "variant_id": 1
  }
}
```

**Respuesta de error (404):**
```json
{
  "message": "Personalización no encontrada"
}
```

---

### 4. Actualizar Personalización

**Endpoint:** `PATCH /personalizacion/actualizarPersonalizacion/:id`

**Ejemplo:** `PATCH /personalizacion/actualizarPersonalizacion/1`

**Descripción:**  
Actualiza una personalización existente. Solo se deben enviar los campos que se quieren modificar.

**Body (actualización parcial):**
```json
{
  "color": "#00FF00"
}
```

O múltiples campos:
```json
{
  "color": "#0000FF",
  "textos": "Nuevo texto",
  "tipo_letra": "Times New Roman"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Personalización actualizada correctamente"
}
```

**Respuesta de error (404):**
```json
{
  "message": "Personalización no encontrada o no se proporcionaron campos para actualizar"
}
```

**Nota importante:**  
Este método es dinámico. Solo actualiza los campos enviados en el body. No es necesario enviar todos los campos, solo los que se quieren modificar.

---

### 5. Eliminar Personalización

**Endpoint:** `DELETE /personalizacion/eliminarPersonalizacion/:id`

**Ejemplo:** `DELETE /personalizacion/eliminarPersonalizacion/1`

**Respuesta exitosa (200):**
```json
{
  "message": "Personalización eliminada correctamente"
}
```

**Respuesta de error (404):**
```json
{
  "message": "Personalización no encontrada"
}
```

---

## Ejemplos de Uso

### Usando cURL

#### Crear una personalización
```bash
curl -X POST http://localhost:10102/personalizacion/crearPersonalizacion \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#FF5733",
    "image_url": "https://ejemplo.com/mi-logo.png",
    "textos": "Juan Pérez",
    "tipo_letra": "Arial",
    "variant_id": 1
  }'
```

#### Obtener todas las personalizaciones
```bash
curl -X GET http://localhost:10102/personalizacion/obtenerPersonalizacion
```

#### Obtener una personalización específica
```bash
curl -X GET http://localhost:10102/personalizacion/obtenerPersonalizacion/1
```

#### Actualizar una personalización
```bash
curl -X PATCH http://localhost:10102/personalizacion/actualizarPersonalizacion/1 \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#00FF00",
    "textos": "Nuevo texto personalizado"
  }'
```

#### Eliminar una personalización
```bash
curl -X DELETE http://localhost:10102/personalizacion/eliminarPersonalizacion/1
```

---

### Usando JavaScript (fetch)

```javascript
const BASE_URL = "http://localhost:10102/personalizacion";

// 1. Crear personalización
async function crearPersonalizacion() {
  const nuevaPersonalizacion = {
    color: "#FF5733",
    image_url: "https://ejemplo.com/imagen.jpg",
    textos: "Mi texto personalizado",
    tipo_letra: "Arial",
    variant_id: 1
  };
  
  const response = await fetch(`${BASE_URL}/crearPersonalizacion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaPersonalizacion)
  });
  
  const data = await response.json();
  console.log('Personalización creada:', data);
}

// 2. Obtener todas las personalizaciones
async function obtenerPersonalizaciones() {
  const response = await fetch(`${BASE_URL}/obtenerPersonalizacion`);
  const personalizaciones = await response.json();
  
  console.log(`Total: ${personalizaciones.length} personalizaciones`);
  personalizaciones.forEach(p => {
    console.log(`ID: ${p.id}, Color: ${p.color}, Texto: ${p.textos}`);
  });
}

// 3. Actualizar personalización
async function actualizarPersonalizacion(id) {
  const cambios = {
    color: "#00FF00",
    textos: "Texto actualizado"
  };
  
  const response = await fetch(`${BASE_URL}/actualizarPersonalizacion/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cambios)
  });
  
  const data = await response.json();
  console.log('Actualización:', data);
}

// 4. Eliminar personalización
async function eliminarPersonalizacion(id) {
  const response = await fetch(`${BASE_URL}/eliminarPersonalizacion/${id}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log('Eliminación:', data);
}
```

---

## Casos de Uso

### Caso 1: Personalización de Camiseta

**Escenario:**  
Un cliente quiere comprar una camiseta con su nombre bordado en color rojo usando la fuente Arial.

**Flujo:**
1. Cliente selecciona la camiseta (variante de producto con ID 5)
2. Cliente elige:
   - Color: Rojo (#FF0000)
   - Texto: "Carlos Rodríguez"
   - Fuente: Arial
   - Imagen: Logo de su empresa
3. Sistema crea la personalización:

```json
POST /personalizacion/crearPersonalizacion
{
  "color": "#FF0000",
  "image_url": "https://empresa.com/logo.png",
  "textos": "Carlos Rodríguez",
  "tipo_letra": "Arial",
  "variant_id": 5
}
```

4. Sistema guarda la personalización y retorna el ID
5. Cliente procede al pago con la personalización asociada

---

### Caso 2: Modificar Personalización Antes del Pago

**Escenario:**  
Un cliente cambió de opinión sobre el color de su personalización antes de completar la compra.

**Flujo:**
1. Cliente ya tiene una personalización con ID 3
2. Cliente quiere cambiar el color de azul a verde
3. Sistema actualiza solo el color:

```json
PATCH /personalizacion/actualizarPersonalizacion/3
{
  "color": "#00FF00"
}
```

4. Los demás campos (texto, fuente, imagen) permanecen sin cambios

---

### Caso 3: Ver Todas las Personalizaciones de un Cliente

**Escenario:**  
Un administrador quiere ver todas las personalizaciones creadas en el sistema.

**Flujo:**
```
GET /personalizacion/obtenerPersonalizacion
```

Retorna todas las personalizaciones con sus detalles.

---

### Caso 4: Eliminar Personalización Cancelada

**Escenario:**  
Un cliente cancela su pedido y la personalización ya no es necesaria.

**Flujo:**
```
DELETE /personalizacion/eliminarPersonalizacion/7
```

La personalización con ID 7 se elimina permanentemente.

---

## Arquitectura

### Flujo de una Petición

```
Cliente HTTP Request
    ↓
Express Router (personalizacion.routes.ts)
    ↓
Controller (personalizacion.controller.ts)
    - Valida datos
    - Maneja errores
    ↓
Repository (personalizacion.repository.ts)
    - Ejecuta queries SQL
    ↓
MySQL Database
    ↓
← Respuesta en sentido inverso
```

### Capas del Sistema

1. **Routes**: Define las rutas HTTP y las asocia con métodos del controller
2. **Controller**: Valida los datos de entrada y maneja la lógica de negocio
3. **Repository**: Ejecuta las queries SQL en la base de datos
4. **DTO**: Define la estructura de datos que se transfieren entre capas

---

## Códigos de Estado HTTP

| Código | Significado | Uso en el Microservicio |
|--------|-------------|-------------------------|
| **200 OK** | Operación exitosa | GET, PATCH, DELETE exitosos |
| **201 Created** | Recurso creado | POST exitoso |
| **400 Bad Request** | Faltan datos obligatorios | Campos requeridos no enviados |
| **404 Not Found** | Recurso no encontrado | Personalización no existe |
| **500 Internal Server Error** | Error del servidor | Error de base de datos |

---

## Validaciones

### Campos Obligatorios (POST)
- ✅ **color**: Debe ser un string (recomendado formato hexadecimal)
- ✅ **image_url**: Debe ser un string (URL válida)
- ✅ **textos**: Debe ser un string (máx. 100 caracteres en BD)
- ✅ **tipo_letra**: Debe ser un string (nombre de fuente)

### Campos Opcionales
- ⚠️ **variant_id**: Puede ser null si la personalización no está asociada a una variante específica

---

## Relación con Otros Microservicios

### Microservicio de Catálogo
- **variant_id** hace referencia a una variante de producto del microservicio de catálogo
- Una personalización se asocia a una variante específica (talla, color del producto)

**Ejemplo de flujo completo:**
1. Cliente selecciona producto del catálogo (ej: Camiseta)
2. Cliente selecciona variante (ej: Talla M, Color Blanco)
3. Cliente personaliza la variante (agrega texto, imagen, color personalizado)
4. Sistema guarda personalización con el `variant_id` correspondiente

---

## Mejoras Futuras

### 1. Validación de Formato de Color
```typescript
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}
```

### 2. Validación de URL de Imagen
```typescript
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### 3. Límite de Caracteres en Textos
```typescript
if (textos.length > 100) {
  res.status(400).json({ message: "El texto excede los 100 caracteres permitidos" });
  return;
}
```

### 4. Obtener Personalizaciones por Variante
```typescript
// Nuevo endpoint
GET /personalizacion/porVariante/:variant_id

// Repository
static async getByVariantId(variant_id: number) {
  const [rows]: any = await pool.query(
    "SELECT * FROM personalizacion WHERE variant_id = ?",
    [variant_id]
  );
  return rows;
}
```

### 5. Vista de Personalización (JOIN)
```sql
SELECT 
  p.*,
  v.size,
  v.color AS product_color,
  v.price
FROM personalizacion p
LEFT JOIN variantes_productos v ON p.variant_id = v.id
WHERE p.id = ?
```

---

## Paleta de Colores Comunes

Para facilitar la personalización, aquí hay códigos hexadecimales comunes:

| Color | Código Hex |
|-------|------------|
| Rojo | #FF0000 |
| Verde | #00FF00 |
| Azul | #0000FF |
| Amarillo | #FFFF00 |
| Negro | #000000 |
| Blanco | #FFFFFF |
| Naranja | #FF5733 |
| Púrpura | #800080 |
| Rosa | #FFC0CB |
| Gris | #808080 |

---

## Fuentes Tipográficas Disponibles

Fuentes comunes que se pueden usar en `tipo_letra`:

- Arial
- Times New Roman
- Verdana
- Helvetica
- Georgia
- Comic Sans MS
- Courier New
- Impact
- Palatino
- Garamond

---

## Notas para la Exposición

### Puntos Clave

1. **Propósito del Microservicio**
   - Permite a los usuarios personalizar productos
   - Agrega valor al producto base con personalización

2. **Arquitectura Simple**
   - Routes → Controller → Repository → Database
   - Separación clara de responsabilidades

3. **Operaciones CRUD Completas**
   - Crear, Leer, Actualizar, Eliminar personalizaciones

4. **Actualización Dinámica**
   - Solo actualiza los campos enviados
   - Eficiente y flexible

5. **Asociación con Variantes**
   - Se relaciona con el microservicio de catálogo
   - Una personalización por variante de producto

6. **Tipos de Personalización**
   - Color (código hexadecimal)
   - Imagen (URL)
   - Texto (hasta 100 caracteres)
   - Fuente tipográfica

---

## Ejemplo Completo de Flujo

### Escenario: Cliente Personaliza una Taza

```
1. Cliente navega en el catálogo
   GET /productos/obtenerProducto/10
   → Obtiene: Taza blanca

2. Cliente selecciona variante (tamaño)
   GET /variantProductos/obtenerVariante/25
   → Obtiene: Taza blanca, tamaño grande, $15.000

3. Cliente personaliza la taza
   POST /personalizacion/crearPersonalizacion
   Body: {
     "color": "#FF0000",
     "image_url": "https://misitioweb.com/foto-familia.jpg",
     "textos": "Familia García 2025",
     "tipo_letra": "Arial",
     "variant_id": 25
   }
   → Respuesta: {message: "Personalización creada", id: {insertId: 15}}

4. Cliente ve vista previa
   GET /personalizacion/obtenerPersonalizacion/15
   → Obtiene la personalización creada

5. Cliente decide cambiar el color
   PATCH /personalizacion/actualizarPersonalizacion/15
   Body: {
     "color": "#0000FF"
   }
   → Respuesta: {message: "Personalización actualizada correctamente"}

6. Cliente procede al checkout
   - Variante ID: 25 (Taza blanca grande)
   - Personalización ID: 15 (Texto, imagen, color azul)
   - Precio base: $15.000
   - Precio personalización: +$5.000
   - Total: $20.000
```

---

## Resumen Técnico

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Express (Node.js) |
| **Lenguaje** | TypeScript |
| **Base de Datos** | MySQL |
| **Puerto** | 10102 |
| **Arquitectura** | Routes → Controller → Repository |
| **Operaciones** | CRUD completo |
| **Actualización** | Dinámica (campos parciales) |

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Microservicio:** Personalización - CraftYourStyle  
**Puerto:** 10102  
**Versión:** 1.0
