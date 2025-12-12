# Documentación del Microservicio de Notificaciones - CraftYourStyle

## Índice
1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Modelo de Datos](#modelo-de-datos)
5. [API Endpoints](#api-endpoints)
6. [Arquitectura](#arquitectura)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Configuración](#configuración)

---

## Descripción General

El microservicio de notificaciones maneja el sistema de notificaciones de CraftYourStyle:
- **Creación de notificaciones** (mensaje de texto, correo electrónico, push)
- **Consulta de notificaciones** registradas en el sistema
- **Base de datos:** CraftYourStyle_Notificaciones (MySQL)

**Tecnología:** FastAPI + SQLAlchemy ORM  
**Puerto por defecto:** 8000  
**Base de datos:** MySQL

---

## Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido para construir APIs
- **SQLAlchemy**: ORM (Object-Relational Mapping) para interactuar con la base de datos
- **Pydantic**: Validación de datos automática
- **PyMySQL**: Driver para conectar con MySQL

### Base de Datos
- **MySQL**: Base de datos relacional

### Ventajas de FastAPI
- ✅ Documentación automática (Swagger UI)
- ✅ Validación automática de datos
- ✅ Alto rendimiento
- ✅ Type hints nativos de Python
- ✅ Async/await support

---

## Estructura del Proyecto

```
notificaciones/
├── app/
│   ├── main.py                    # Punto de entrada de la aplicación
│   ├── api/
│   │   └── routes.py             # Definición de rutas/endpoints
│   ├── core/
│   │   ├── config.py             # Configuración de base de datos
│   │   └── email_client.py       # Cliente de email (futuro)
│   ├── models/
│   │   └── notification.py       # Modelos SQLAlchemy (tablas BD)
│   ├── schemas/
│   │   └── esquema.py            # Schemas Pydantic (validación)
│   └── services/
│       └── notificacion.py       # Lógica de negocio
├── CraftYourStyle-Notificaciones.sql  # Script de creación de BD
├── requirements.txt               # Dependencias Python
└── .env                          # Variables de entorno

```

---

## Modelo de Datos

### Tabla: notificaciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **id** | INT (PK, AUTO_INCREMENT) | Identificador único |
| **tipo_de_notificacion** | ENUM | Tipo: 'mensaje_texto', 'correo_electronico', 'push' |
| **mensaje** | VARCHAR(250) | Contenido de la notificación |

### Tipos de Notificación

1. **mensaje_texto**: Notificación por SMS o mensaje de texto
2. **correo_electronico**: Notificación por email
3. **push**: Notificación push en aplicación móvil

---

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Documentación Interactiva Automática
FastAPI genera automáticamente documentación interactiva:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

### 1. Crear Notificación

**Endpoint:** `POST /`

**Descripción:**  
Crea una nueva notificación en el sistema.

**Body (JSON):**
```json
{
  "tipo_de_notificacion": "mensaje_texto",
  "mensaje": "Tu pedido ha sido enviado y llegará mañana"
}
```

**Tipos válidos:**
- `"mensaje_texto"`
- `"correo_electronico"`
- `"push"`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "tipo_de_notificacion": "mensaje_texto",
  "mensaje": "Tu pedido ha sido enviado y llegará mañana"
}
```

**Respuesta de error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "tipo_de_notificacion"],
      "msg": "value is not a valid enumeration member; permitted: 'mensaje_texto', 'correo_electronico', 'push'",
      "type": "type_error.enum"
    }
  ]
}
```

**Códigos de estado:**
- **200**: Notificación creada exitosamente
- **422**: Datos inválidos (tipo de notificación no válido o campos faltantes)

---

### 2. Obtener Todas las Notificaciones

**Endpoint:** `GET /`

**Descripción:**  
Obtiene todas las notificaciones registradas en el sistema.

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "tipo_de_notificacion": "mensaje_texto",
    "mensaje": "Tu pedido ha sido enviado"
  },
  {
    "id": 2,
    "tipo_de_notificacion": "correo_electronico",
    "mensaje": "Confirmación de compra"
  },
  {
    "id": 3,
    "tipo_de_notificacion": "push",
    "mensaje": "Nueva promoción disponible"
  }
]
```

**Si no hay notificaciones:**
```json
[]
```

**Códigos de estado:**
- **200**: Lista obtenida exitosamente (puede estar vacía)

---

## Arquitectura

### Flujo de una Petición

```
Cliente HTTP Request
    ↓
FastAPI Router (routes.py)
    ↓
Endpoint Function (validación automática con Pydantic)
    ↓
Service Layer (notificacion.py) - Lógica de negocio
    ↓
SQLAlchemy ORM
    ↓
MySQL Database
    ↓
← Respuesta en sentido inverso (JSON)
```

### Capas del Sistema

#### 1. **Routes (API Layer)**
- Define los endpoints HTTP
- Maneja peticiones y respuestas
- Inyecta dependencias (como la sesión de BD)

#### 2. **Schemas (Validation Layer)**
- Valida datos de entrada usando Pydantic
- Serializa datos de salida
- Define la estructura de los datos

#### 3. **Services (Business Logic Layer)**
- Contiene la lógica de negocio
- Interactúa con los modelos de base de datos
- Procesa y transforma datos

#### 4. **Models (Data Layer)**
- Define la estructura de las tablas
- Mapea clases Python a tablas SQL (ORM)
- Usa SQLAlchemy

#### 5. **Config (Configuration Layer)**
- Configuración de base de datos
- Variables de entorno
- Inicialización de recursos

---

## Arquitectura Detallada

### 1. main.py - Punto de Entrada
```python
# Crea la aplicación FastAPI
app = FastAPI(title="Notification Microservice 🚀")

# Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

# Registra las rutas
app.include_router(notificacion_router)
```

### 2. routes.py - Definición de Endpoints
```python
# Dependency Injection para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db  # Proporciona la sesión
    finally:
        db.close()  # Limpia la sesión

# Endpoint con validación automática
@router.post("/", response_model=NotificacionResponse)
def add_notification(
    notification: NotificacionCreate,  # Validado por Pydantic
    db: Session = Depends(get_db)     # Inyectado automáticamente
):
    return crear_notificacion(db, notification)
```

### 3. Schemas (Pydantic)
```python
# Validación de entrada
class NotificacionCreate(BaseModel):
    tipo_de_notificacion: TipoNotificacion  # Enum
    mensaje: str  # Obligatorio

# Validación de salida (incluye ID)
class NotificacionResponse(NotificacionCreate):
    id: int
    
    class Config:
        from_attributes = True  # Permite convertir desde SQLAlchemy
```

### 4. Models (SQLAlchemy)
```python
# Modelo ORM - mapea a tabla SQL
class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo_de_notificacion = Column(Enum(TipoNotificacion), nullable=False)
    mensaje = Column(String(250), nullable=False)
```

### 5. Services - Lógica de Negocio
```python
def crear_notificacion(db: Session, data: NotificacionCreate):
    nueva = Notificacion(**data.dict())  # Crea instancia
    db.add(nueva)                        # Añade a sesión
    db.commit()                          # Guarda en BD
    db.refresh(nueva)                    # Actualiza con ID
    return nueva                         # Retorna objeto
```

---

## Ejemplos de Uso

### Usando cURL

#### Crear una notificación de texto
```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_de_notificacion": "mensaje_texto",
    "mensaje": "Tu pedido #1234 ha sido confirmado"
  }'
```

#### Crear una notificación de email
```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_de_notificacion": "correo_electronico",
    "mensaje": "Bienvenido a CraftYourStyle"
  }'
```

#### Crear una notificación push
```bash
curl -X POST http://localhost:8000/ \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_de_notificacion": "push",
    "mensaje": "Nueva promoción: 20% de descuento"
  }'
```

#### Obtener todas las notificaciones
```bash
curl -X GET http://localhost:8000/
```

---

### Usando Python (requests)

```python
import requests

# URL base del microservicio
BASE_URL = "http://localhost:8000"

# 1. Crear una notificación
nueva_notificacion = {
    "tipo_de_notificacion": "mensaje_texto",
    "mensaje": "Tu pedido está en camino"
}

response = requests.post(f"{BASE_URL}/", json=nueva_notificacion)
print(response.json())
# Output: {"id": 1, "tipo_de_notificacion": "mensaje_texto", "mensaje": "Tu pedido está en camino"}

# 2. Obtener todas las notificaciones
response = requests.get(f"{BASE_URL}/")
notificaciones = response.json()
print(f"Total de notificaciones: {len(notificaciones)}")
for notif in notificaciones:
    print(f"ID: {notif['id']}, Tipo: {notif['tipo_de_notificacion']}, Mensaje: {notif['mensaje']}")
```

---

### Usando JavaScript (fetch)

```javascript
// URL base del microservicio
const BASE_URL = "http://localhost:8000";

// 1. Crear una notificación
async function crearNotificacion() {
  const nuevaNotificacion = {
    tipo_de_notificacion: "correo_electronico",
    mensaje: "Confirmación de registro exitoso"
  };
  
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaNotificacion)
  });
  
  const data = await response.json();
  console.log('Notificación creada:', data);
}

// 2. Obtener todas las notificaciones
async function obtenerNotificaciones() {
  const response = await fetch(`${BASE_URL}/`);
  const notificaciones = await response.json();
  
  console.log(`Total: ${notificaciones.length} notificaciones`);
  notificaciones.forEach(notif => {
    console.log(`ID: ${notif.id}, Tipo: ${notif.tipo_de_notificacion}, Mensaje: ${notif.mensaje}`);
  });
}

// Ejecutar
crearNotificacion();
obtenerNotificaciones();
```

---

## Configuración

### Variables de Entorno (.env)

El microservicio usa variables de entorno para configuración flexible:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=craftyourstyle_notificaciones
DB_PORT=3306
```

### Valores por Defecto

Si no se definen variables de entorno, se usan estos valores:

| Variable | Valor por Defecto |
|----------|-------------------|
| DB_HOST | localhost |
| DB_USER | root |
| DB_PASSWORD | "" (vacío) |
| DB_NAME | craftyourstyle_notificaciones |
| DB_PORT | 3306 |

---

## Instalación y Ejecución

### 1. Instalar Dependencias

```bash
pip install -r requirements.txt
```

**Dependencias principales:**
- fastapi
- uvicorn (servidor ASGI)
- sqlalchemy
- pymysql
- pydantic

### 2. Configurar Base de Datos

Ejecutar el script SQL para crear la base de datos y tabla:

```bash
mysql -u root -p < CraftYourStyle-Notificaciones.sql
```

O manualmente en MySQL:
```sql
CREATE DATABASE IF NOT EXISTS CraftYourStyle_Notificaciones;
USE CraftYourStyle_Notificaciones;

CREATE TABLE notificaciones(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_de_notificacion ENUM('mensaje_texto','correo_electronico','push') NOT NULL,
    mensaje VARCHAR(250) NOT NULL
);
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=CraftYourStyle_Notificaciones
DB_PORT=3306
```

### 4. Ejecutar el Microservicio

```bash
uvicorn app.main:app --reload
```

O especificar puerto:
```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Verificar que Funciona

Abrir en el navegador:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Características de FastAPI

### 1. Documentación Automática (Swagger UI)

FastAPI genera automáticamente una interfaz interactiva en `/docs`:

- 📝 Lista de todos los endpoints
- 🧪 Probar APIs directamente desde el navegador
- 📋 Ver schemas de entrada/salida
- 🔍 Detalles de cada endpoint

### 2. Validación Automática

Pydantic valida automáticamente:
- ✅ Tipos de datos
- ✅ Campos obligatorios
- ✅ Valores de enums
- ✅ Longitud de strings

Si los datos son inválidos, FastAPI retorna un error 422 con detalles precisos.

### 3. Serialización Automática

FastAPI convierte automáticamente:
- Modelos SQLAlchemy → JSON
- JSON → Modelos Pydantic
- Objetos Python → JSON

### 4. Dependency Injection

El sistema de dependencias permite:
- Reutilizar código
- Inyectar sesiones de BD
- Gestionar recursos automáticamente

### 5. Type Hints

Python type hints proporcionan:
- Autocompletado en IDEs
- Detección de errores
- Documentación clara

---

## Ventajas del ORM (SQLAlchemy)

### Sin ORM (SQL Raw)
```python
cursor.execute("INSERT INTO notificaciones (tipo_de_notificacion, mensaje) VALUES (%s, %s)", 
               (tipo, mensaje))
result = cursor.fetchone()
```

### Con ORM (SQLAlchemy)
```python
nueva = Notificacion(tipo_de_notificacion=tipo, mensaje=mensaje)
db.add(nueva)
db.commit()
```

**Ventajas:**
- ✅ Código más limpio y legible
- ✅ Prevención de SQL injection
- ✅ Tipado fuerte
- ✅ Abstracción de la base de datos
- ✅ Migraciones más fáciles

---

## Códigos de Estado HTTP

| Código | Significado | Uso en el Microservicio |
|--------|-------------|-------------------------|
| **200 OK** | Operación exitosa | POST y GET exitosos |
| **422 Unprocessable Entity** | Datos inválidos | Tipo de notificación inválido, campos faltantes |
| **500 Internal Server Error** | Error del servidor | Error de base de datos, error no manejado |

---

## Comparación: FastAPI vs Express (Node.js)

| Aspecto | FastAPI (Python) | Express (Node.js) |
|---------|------------------|-------------------|
| **Documentación automática** | ✅ Sí (Swagger) | ❌ No (manual) |
| **Validación de datos** | ✅ Automática (Pydantic) | ⚠️ Manual (joi, express-validator) |
| **Type hints** | ✅ Nativos de Python | ⚠️ Requiere TypeScript |
| **ORM integrado** | ✅ SQLAlchemy | ⚠️ Separado (Sequelize, Prisma) |
| **Rendimiento** | 🚀 Muy alto | 🚀 Alto |
| **Curva de aprendizaje** | 📚 Media | 📚 Baja |

---

## Flujo Completo de una Petición

### POST - Crear Notificación

```
1. Cliente envía: POST http://localhost:8000/
   Body: {"tipo_de_notificacion": "mensaje_texto", "mensaje": "Hola"}

2. FastAPI recibe la petición
   ↓
3. Pydantic valida los datos (NotificacionCreate)
   - ¿tipo_de_notificacion es válido? ✓
   - ¿mensaje existe? ✓
   ↓
4. Se inyecta la sesión de BD (Depends(get_db))
   ↓
5. Se llama a crear_notificacion(db, data)
   ↓
6. Se crea instancia de Notificacion (SQLAlchemy)
   ↓
7. Se añade a la sesión: db.add(nueva)
   ↓
8. Se guarda en BD: db.commit()
   Query SQL ejecutado:
   INSERT INTO notificaciones (tipo_de_notificacion, mensaje) 
   VALUES ('mensaje_texto', 'Hola')
   ↓
9. Se obtiene el ID generado: db.refresh(nueva)
   ↓
10. Se retorna el objeto Notificacion
    ↓
11. FastAPI serializa a JSON (usando NotificacionResponse)
    ↓
12. Cliente recibe: {"id": 1, "tipo_de_notificacion": "mensaje_texto", "mensaje": "Hola"}
```

---

## Notas para la Exposición

### Puntos Clave

1. **FastAPI es moderno y rápido**
   - Documentación automática
   - Validación automática
   - Alto rendimiento

2. **Arquitectura en capas clara**
   - Routes → Services → Models
   - Separación de responsabilidades

3. **ORM simplifica el trabajo con BD**
   - No escribir SQL manualmente
   - Previene errores y SQL injection

4. **Pydantic valida automáticamente**
   - No necesitas validar manualmente
   - Errores claros y descriptivos

5. **Dependency Injection**
   - Gestión automática de recursos
   - Código más limpio y reutilizable

6. **Type Hints de Python**
   - Mejor experiencia de desarrollo
   - Menos errores

---

## Posibles Mejoras Futuras

### 1. Agregar Más Endpoints

```python
# Obtener notificación por ID
@router.get("/{notificacion_id}")
def get_notification_by_id(notificacion_id: int, db: Session = Depends(get_db)):
    ...

# Actualizar notificación
@router.put("/{notificacion_id}")
def update_notification(notificacion_id: int, data: NotificacionCreate, db: Session = Depends(get_db)):
    ...

# Eliminar notificación
@router.delete("/{notificacion_id}")
def delete_notification(notificacion_id: int, db: Session = Depends(get_db)):
    ...

# Filtrar por tipo
@router.get("/tipo/{tipo}")
def get_by_type(tipo: TipoNotificacion, db: Session = Depends(get_db)):
    ...
```

### 2. Implementar Envío Real de Notificaciones

- **Email**: Usar SMTP o servicios como SendGrid
- **SMS**: Integrar Twilio o similar
- **Push**: Usar Firebase Cloud Messaging

### 3. Agregar Autenticación

- JWT tokens
- OAuth2
- API Keys

### 4. Paginación

```python
@router.get("/")
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Notificacion).offset(skip).limit(limit).all()
```

### 5. Manejo de Errores Personalizado

```python
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Error interno del servidor"}
    )
```

### 6. Logs y Monitoreo

- Logging estructurado
- Métricas de rendimiento
- Alertas

### 7. Tests Automatizados

```python
def test_crear_notificacion():
    response = client.post("/", json={
        "tipo_de_notificacion": "mensaje_texto",
        "mensaje": "Test"
    })
    assert response.status_code == 200
    assert response.json()["mensaje"] == "Test"
```

---

## Resumen Técnico

| Aspecto | Detalle |
|---------|---------|
| **Framework** | FastAPI |
| **ORM** | SQLAlchemy |
| **Validación** | Pydantic |
| **Base de Datos** | MySQL |
| **Driver BD** | PyMySQL |
| **Servidor** | Uvicorn (ASGI) |
| **Documentación** | Swagger UI (automática) |
| **Lenguaje** | Python 3.11+ |

---

## Fin de la Documentación

**Fecha de creación:** 2025-12-12  
**Microservicio:** Notificaciones - CraftYourStyle  
**Puerto por defecto:** 8000  
**Versión:** 1.0
