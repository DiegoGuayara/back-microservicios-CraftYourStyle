# 📚 Explicación Completa de Archivos del Proyecto

Este documento explica en detalle qué hace cada archivo del microservicio de Agente de IA.

---

## 📁 Estructura General

```
agente IA/
├── app/                    # Carpeta principal de la aplicación
│   ├── config/            # Archivos de configuración
│   ├── models/            # Modelos de base de datos (tablas)
│   ├── schemas/           # Validación de datos (entrada/salida)
│   ├── agents/            # Agentes de IA con Mirascope
│   ├── services/          # Lógica de negocio
│   ├── routes/            # Endpoints del API
│   └── main.py           # Archivo principal
├── uploads/               # Carpeta temporal para imágenes
├── venv/                  # Entorno virtual Python
├── .env                   # Variables de entorno (secretos)
├── .gitignore            # Archivos que Git ignora
├── Dockerfile            # Para crear imagen Docker
├── requirements.txt      # Dependencias Python
└── README.md            # Documentación del proyecto
```

---

## 🔧 Archivos de Configuración

### 1. `app/config/settings.py`

**Propósito**: Define TODAS las configuraciones de la aplicación.

**Qué hace**:
- Lee variables del archivo `.env` (como API keys, credenciales de BD)
- Valida que las configuraciones sean del tipo correcto (string, int, etc.)
- Proporciona valores por defecto
- Genera la URL de conexión a MySQL

**Partes importantes**:
```python
class Settings(BaseSettings):
    # Configuración de base de datos
    DB_HOST: str = "localhost"  # Dónde está MySQL
    DB_USER: str = "root"       # Usuario
    DB_PASSWORD: str = ""       # Contraseña
    DB_NAME: str = "CraftYourStyle_Personalizacion"
    DB_PORT: int = 3306
    
    # API de IA
    GEMINI_API_KEY: str  # Tu API key de Google Gemini
    
    # Cloudinary (almacenar imágenes)
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    
    # Banana (modelos ML para try-on)
    BANANA_API_KEY: Optional[str] = None
```

**Por qué existe**: Centraliza toda la configuración en un solo lugar. Si necesitas cambiar algo (como el puerto o la BD), solo editas el `.env`.

---

### 2. `app/config/database.py`

**Propósito**: Maneja la conexión a MySQL usando SQLAlchemy.

**Qué hace**:
- Crea el "engine" (motor de conexión a MySQL)
- Define `SessionLocal` (fábrica para crear sesiones de BD)
- Define `Base` (clase padre de todos los modelos)
- Proporciona `get_db()` para inyectar la BD en endpoints

**Partes importantes**:
```python
# Crea la conexión a MySQL
engine = create_engine(
    settings.database_url,  # mysql+pymysql://root:@localhost:3306/...
    pool_pre_ping=True,     # Verifica que la conexión esté viva
    pool_recycle=3600,      # Recicla conexiones cada hora
)

# Fábrica para crear sesiones
SessionLocal = sessionmaker(bind=engine)

# Función para inyectar BD en endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db  # Devuelve la sesión
    finally:
        db.close()  # Siempre cierra al terminar
```

**Por qué existe**: SQLAlchemy necesita configuración para conectarse a MySQL. Este archivo lo hace una sola vez y lo reutiliza en todo el proyecto.

---

### 3. `app/config/storage.py`

**Propósito**: Maneja la subida y eliminación de imágenes en Cloudinary.

**Qué hace**:
- Configura Cloudinary con tus credenciales
- `upload_image()`: Sube una imagen local a Cloudinary
- `delete_image()`: Elimina una imagen de Cloudinary

**Ejemplo de uso**:
```python
# Subir imagen
result = await upload_image("temp/foto.jpg", folder="users/1/designs")
print(result["url"])  # https://res.cloudinary.com/...

# Eliminar imagen
await delete_image("craftyourstyle/users/1/designs/abc123")
```

**Por qué existe**: Las imágenes no deben guardarse en el servidor (se llena rápido). Cloudinary es un servicio en la nube especializado en almacenar y servir imágenes.

---

## 📊 Modelos de Base de Datos

Los modelos representan las tablas de MySQL usando código Python.

### 4. `app/models/sesion.py`

**Propósito**: Representa las sesiones de chat con el agente.

**Tabla MySQL**: `sesiones_ia`

**Columnas**:
- `id`: ID único de la sesión
- `id_user`: ID del usuario (quién está chateando)
- `fecha_inicio`: Cuándo empezó la sesión
- `fecha_fin`: Cuándo terminó (NULL si está activa)
- `estado`: "activa" o "finalizada"

**Ejemplo**:
```python
# Crear sesión
sesion = SesionIA(id_user=1)
db.add(sesion)
db.commit()

# Consultar sesiones activas
sesiones = db.query(SesionIA).filter(
    SesionIA.estado == "activa"
).all()
```

**Por qué existe**: Agrupa todos los mensajes de una conversación. Permite saber cuándo empezó y terminó una conversación.

---

### 5. `app/models/mensaje.py`

**Propósito**: Representa cada mensaje en el chat.

**Tabla MySQL**: `mensajes_ia`

**Columnas**:
- `id`: ID único del mensaje
- `sesion_id`: A qué sesión pertenece
- `tipo`: "usuario" o "ia" (quién envió el mensaje)
- `contenido`: El texto del mensaje
- `metadata`: Información extra (ej: URLs de imágenes adjuntas) en formato JSON
- `timestamp`: Cuándo se envió

**Ejemplo**:
```python
# Guardar mensaje del usuario
mensaje = MensajeIA(
    sesion_id=1,
    tipo=TipoMensaje.USUARIO,
    contenido="Quiero personalizar una camiseta",
    metadata={"imagenes": ["https://..."]}
)
db.add(mensaje)

# Obtener historial
mensajes = db.query(MensajeIA).filter(
    MensajeIA.sesion_id == 1
).order_by(MensajeIA.timestamp).all()
```

**Por qué existe**: Guarda todo el historial de conversación. Permite al agente tener contexto de mensajes anteriores.

---

### 6. `app/models/imagen.py`

**Propósito**: Representa imágenes de diseño subidas por usuarios.

**Tabla MySQL**: `imagenes`

**Columnas**:
- `id`: ID único
- `image_url`: URL de la imagen en Cloudinary
- `variant_id`: Variante de producto a la que pertenece
- `tipo`: "producto", "usuario_diseño", "logo"

**Ejemplo**:
```python
imagen = Imagen(
    image_url="https://res.cloudinary.com/...",
    tipo=TipoImagen.LOGO,
    variant_id=5
)
```

**Por qué existe**: Relaciona imágenes con productos. Permite saber qué diseños personalizados tiene cada prenda.

---

### 7. `app/models/foto_usuario.py`

**Propósito**: Guarda fotos del usuario para virtual try-on.

**Tabla MySQL**: `fotos_usuario`

**Columnas**:
- `id`: ID único
- `id_user`: Usuario dueño de la foto
- `foto_url`: URL de la foto
- `es_principal`: Si es la foto principal (booleano)
- `fecha_subida`: Cuándo se subió

**Ejemplo**:
```python
foto = FotoUsuario(
    id_user=1,
    foto_url="https://...",
    es_principal=True
)
```

**Por qué existe**: Para el virtual try-on necesitamos fotos del usuario. Esto guarda esas fotos.

---

### 8. `app/models/prueba_virtual.py`

**Propósito**: Guarda resultados de virtual try-on.

**Tabla MySQL**: `pruebas_virtuales`

**Columnas**:
- `id`: ID único
- `id_user`: Usuario
- `foto_usuario_id`: Foto usada
- `personalizacion_id`: Diseño aplicado
- `variant_id`: Producto probado
- `imagen_resultado_url`: Imagen generada con la prenda puesta
- `favorito`: Si está marcado como favorito

**Por qué existe**: Guarda los try-ons generados para que el usuario pueda verlos después y marcar favoritos.

---

### 9. `app/models/personalizacion.py`

**Propósito**: Representa personalizaciones de prendas.

**Tabla MySQL**: `personalizacion`

**Columnas**:
- `id`: ID único
- `color`: Color en hex (#FF0000)
- `image_url`: URL del diseño
- `textos`: Texto a imprimir
- `tipo_letra`: Fuente del texto
- `variant_id`: Variante del producto

**Por qué existe**: Almacena cómo el usuario quiere personalizar cada prenda (color, texto, imagen).

---

## ✅ Schemas (Validación)

Los schemas validan que los datos recibidos/enviados sean correctos.

### 10. `app/schemas/chat.py`

**Propósito**: Define cómo deben ser los datos del chat.

**Schemas principales**:

```python
# Lo que el usuario envía
class MensajeRequest(BaseModel):
    mensaje: str  # Obligatorio
    imagenes: Optional[List[str]] = None  # Opcional

# Lo que el API responde
class ChatResponse(BaseModel):
    sesion_id: int
    mensaje: str
    imagenes_generadas: Optional[List[str]] = None
```

**Por qué existe**: Pydantic valida automáticamente que los datos sean correctos. Si el usuario envía datos inválidos, FastAPI responde con error 422.

---

### 11. `app/schemas/image.py` y `app/schemas/tryon.py`

Similar a `chat.py`, definen la estructura de datos para:
- Subir imágenes
- Crear fotos de usuario
- Generar virtual try-on
- Marcar favoritos

---

## 🤖 Agentes de IA

### 12. `app/agents/fashion_agent.py`

**Propósito**: El cerebro del agente de IA.

**Funciones principales**:

1. **`fashion_agent()`**: Agente principal que conversa con el usuario
```python
@mirascope.call(model="gemini-1.5-flash")
@prompt_template("""
    SYSTEM: Eres un experto en moda...
    USER: {user_message}
""")
async def fashion_agent(user_message: str, context: str):
    pass
```

2. **`generate_design_prompt()`**: Genera prompts para Stable Diffusion
```python
# Usuario: "Quiero un logo de un león"
# Genera: "t-shirt with detailed lion logo, high quality, 4k..."
```

3. **`analyze_user_image()`**: Analiza imágenes que el usuario sube
```python
# Analiza: "Es un logo minimalista en negro, estilo moderno..."
```

**Por qué existe**: Mirascope facilita crear agentes de IA con prompts estructurados. Aquí está toda la "inteligencia" del agente.

---

### 13. `app/agents/prompts.py`

**Propósito**: Almacena todos los prompts del sistema.

**Ejemplo**:
```python
FASHION_AGENT_SYSTEM_PROMPT = """
Eres un asistente experto en moda...
Tus capacidades son:
1. Personalización de prendas
2. Análisis de imágenes
3. Recomendaciones de moda
...
```

**Por qué existe**: Separar los prompts del código hace más fácil modificarlos y experimentar.

---

### 14. `app/agents/tools.py`

**Propósito**: Herramientas auxiliares que el agente puede usar.

**Funciones**:
- `get_product_info()`: Obtiene info de un producto
- `get_color_recommendations()`: Sugiere colores que combinan
- `validate_design_position()`: Valida si una posición es válida (ej: "pecho", "espalda")

---

## 🔧 Servicios (Lógica de Negocio)

Los servicios contienen la lógica compleja. Separan la lógica de los endpoints.

### 15. `app/services/agent_service.py`

**Propósito**: Maneja toda la lógica del chat.

**Métodos principales**:

```python
class AgentService:
    # Crear sesión
    async def create_session(db, id_user):
        sesion = SesionIA(id_user=id_user)
        db.add(sesion)
        db.commit()
        return sesion
    
    # Procesar mensaje
    async def process_user_message(db, sesion_id, mensaje, imagenes):
        # 1. Guardar mensaje del usuario
        # 2. Obtener historial para contexto
        # 3. Analizar imágenes si las hay
        # 4. Llamar al agente de IA
        # 5. Guardar respuesta
        # 6. Devolver respuesta
```

**Por qué existe**: Centraliza toda la lógica del chat. Los endpoints solo llaman a estos métodos.

---

### 16. `app/services/image_service.py`

**Propósito**: Maneja subida de imágenes.

**Flujo**:
1. Recibe el archivo
2. Lo guarda temporalmente en `uploads/`
3. Lo sube a Cloudinary
4. Guarda la URL en la base de datos
5. Elimina el archivo temporal
6. Devuelve la información

---

### 17. `app/services/tryon_service.py`

**Propósito**: Genera virtual try-ons usando Banana.

**Flujo**:
1. Obtiene la foto del usuario
2. Obtiene la imagen de la prenda
3. Llama al API de Banana (modelo de ML)
4. Banana genera imagen con la prenda puesta
5. Guarda el resultado en BD

**Nota**: Actualmente usa un placeholder. Necesitas configurar un modelo real en Banana.

---

## 🛣️ Rutas (Endpoints)

### 18. `app/routes/chat.py`

**Endpoints de chat**:

| Endpoint | Método | Qué hace |
|----------|--------|----------|
| `/chat/session` | POST | Crea una nueva sesión |
| `/chat/session/{id}` | GET | Obtiene info de una sesión |
| `/chat/session/user/{id_user}` | GET | Obtiene sesión activa del usuario |
| `/chat/session/{id}/close` | POST | Cierra una sesión |
| `/chat/session/{id}/history` | GET | Obtiene historial de mensajes |
| `/chat/session/{id}/message` | POST | Envía mensaje al agente |

**Ejemplo de endpoint**:
```python
@router.post("/session/{sesion_id}/message")
async def send_message(
    sesion_id: int,
    request: MensajeRequest,  # Valida automáticamente
    db: Session = Depends(get_db)  # Inyecta BD
):
    # Procesar mensaje
    respuesta = await AgentService.process_user_message(
        db, sesion_id, request.mensaje, request.imagenes
    )
    return ChatResponse(sesion_id=sesion_id, mensaje=respuesta)
```

**Por qué existe**: Define los endpoints del API. FastAPI convierte estos decoradores en endpoints HTTP reales.

---

### 19. `app/routes/images.py`

**Endpoints de imágenes**:
- `POST /images/design`: Sube imagen de diseño
- `POST /images/photo`: Sube foto de usuario
- `GET /images/photos/{id_user}`: Lista fotos del usuario
- `DELETE /images/photo/{id}`: Elimina una foto

---

### 20. `app/routes/tryon.py`

**Endpoints de virtual try-on**:
- `POST /tryon/generate`: Genera un try-on
- `GET /tryon/user/{id_user}`: Lista try-ons del usuario
- `PATCH /tryon/{id}/favorite`: Marca/desmarca favorito

---

## 📄 Otros Archivos

### 21. `.env`

**Propósito**: Almacena variables de entorno (secretos).

**Contenido**:
```env
GEMINI_API_KEY=tu_api_key_aqui
DB_PASSWORD=tu_contraseña
CLOUDINARY_API_KEY=tu_key
```

**¡IMPORTANTE!**: NUNCA subir este archivo a Git. Contiene información sensible.

---

### 22. `requirements.txt`

**Propósito**: Lista todas las dependencias Python.

Cuando corres `pip install -r requirements.txt`, instala:
- fastapi
- uvicorn
- mirascope
- sqlalchemy
- pymysql
- cloudinary
- etc.

---

### 23. `Dockerfile`

**Propósito**: Instrucciones para crear una imagen Docker.

**Qué hace**:
1. Usa Python 3.11 como base
2. Instala las dependencias del sistema
3. Copia requirements.txt
4. Instala dependencias Python
5. Copia el código
6. Expone el puerto 10105
7. Define el comando para iniciar: `uvicorn app.main:app`

---

### 24. `.gitignore`

**Propósito**: Indica a Git qué archivos NO subir al repositorio.

**Ignora**:
- `venv/` (entorno virtual - muy pesado)
- `__pycache__/` (archivos temporales de Python)
- `.env` (secretos)
- `uploads/` (imágenes temporales)

---

## 🔄 Flujo Completo: Usuario Chatea con IA

1. **Usuario** envía petición: `POST /chat/session/1/message`
   ```json
   {
     "mensaje": "Quiero una camiseta con un león",
     "imagenes": ["https://mi-logo-leon.jpg"]
   }
   ```

2. **FastAPI** recibe la petición en `app/routes/chat.py`

3. **Pydantic** valida que los datos sean correctos (schema)

4. **FastAPI** inyecta la sesión de BD con `get_db()`

5. **Endpoint** llama a `AgentService.process_user_message()`

6. **AgentService**:
   - Guarda mensaje del usuario en BD
   - Obtiene historial de mensajes anteriores
   - Llama a `analyze_user_image()` para analizar el logo
   - Llama a `fashion_agent()` con el mensaje y contexto

7. **Mirascope** envía el prompt a **Gemini**

8. **Gemini** procesa y devuelve respuesta: "¡Genial! Un león queda perfecto..."

9. **AgentService** guarda la respuesta en BD

10. **Endpoint** devuelve respuesta al usuario:
    ```json
    {
      "sesion_id": 1,
      "mensaje": "¡Genial! Un león queda perfecto...",
      "imagenes_generadas": null
    }
    ```

---

## 📚 Resumen

| Tipo | Archivos | Propósito |
|------|----------|-----------|
| **Config** | settings.py, database.py, storage.py | Configuración |
| **Models** | sesion.py, mensaje.py, imagen.py, etc. | Tablas de BD |
| **Schemas** | chat.py, image.py, tryon.py | Validación |
| **Agents** | fashion_agent.py, prompts.py, tools.py | IA |
| **Services** | agent_service.py, image_service.py, tryon_service.py | Lógica |
| **Routes** | chat.py, images.py, tryon.py | Endpoints |
| **Main** | main.py | Aplicación principal |
| **Deploy** | Dockerfile, docker-compose.yml | Despliegue |
| **Docs** | README.md, .env, requirements.txt | Documentación |

---

**¿Tienes dudas sobre algún archivo específico?** Pregúntame y te lo explico más a detalle! 🚀
