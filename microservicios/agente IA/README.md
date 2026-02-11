# 🤖 CraftYourStyle - Agente de IA

Microservicio de agente de IA para personalización de moda usando Mirascope, FastAPI y Banana.

## 🚀 Características

- **Chat inteligente** con agente de IA especializado en moda
- **Análisis de imágenes** usando GPT-4 Vision
- **Virtual Try-On** con modelos de ML (Banana)
- **Personalización de prendas** con diseños personalizados
- **Gestión de sesiones** de conversación
- **Almacenamiento en la nube** con Cloudinary

## 🛠️ Tecnologías

- **FastAPI** - Framework web
- **Mirascope** - Framework para agentes de IA
- **SQLAlchemy** - ORM para MySQL
- **Banana** - Hosting de modelos ML
- **Cloudinary** - Almacenamiento de imágenes
- **OpenAI GPT-4** - Modelo de lenguaje

## 📋 Requisitos

- Python 3.11+
- MySQL 8.0+
- Cuenta de OpenAI (API Key)
- Cuenta de Cloudinary (opcional)
- Cuenta de Banana (opcional)

## 🔧 Instalación

### 1. Crear entorno virtual

```bash
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=CraftYourStyle_Personalizacion
DB_PORT=3306

# OpenAI
OPENAI_API_KEY=tu_api_key_aqui

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Banana
BANANA_API_KEY=tu_banana_key
```

### 4. Crear base de datos

Ejecuta el script SQL de personalización para crear las tablas necesarias.

### 5. Ejecutar el servidor

```bash
# Desarrollo
python -m uvicorn app.main:app --reload --port 10105

# O directamente
python app/main.py
```

## 📚 API Endpoints

### Chat

- `POST /chat/session` - Crear sesión de chat
- `GET /chat/session/{sesion_id}` - Obtener sesión
- `GET /chat/session/user/{id_user}` - Obtener sesión activa del usuario
- `POST /chat/session/{sesion_id}/close` - Cerrar sesión
- `GET /chat/session/{sesion_id}/history` - Obtener historial
- `POST /chat/session/{sesion_id}/message` - Enviar mensaje al agente

### Imágenes

- `POST /images/design` - Subir imagen de diseño
- `POST /images/photo` - Subir foto de usuario
- `GET /images/photos/{id_user}` - Obtener fotos del usuario
- `DELETE /images/photo/{foto_id}` - Eliminar foto

### Virtual Try-On

- `POST /tryon/generate` - Generar virtual try-on
- `GET /tryon/user/{id_user}` - Obtener try-ons del usuario
- `PATCH /tryon/{prueba_id}/favorite` - Marcar como favorito

## 🐳 Docker

### Construir imagen

```bash
docker build -t craftyourstyle-ai-agent .
```

### Ejecutar contenedor

```bash
docker run -p 10105:10105 --env-file .env craftyourstyle-ai-agent
```

## 📖 Uso del Agente

### Ejemplo de chat

```python
import requests

# Crear sesión
response = requests.post("http://localhost:10105/chat/session", json={
    "id_user": 1
})
sesion_id = response.json()["id"]

# Enviar mensaje
response = requests.post(f"http://localhost:10105/chat/session/{sesion_id}/message", json={
    "mensaje": "Quiero personalizar una camiseta con mi logo",
    "imagenes": ["https://example.com/logo.png"]
})

print(response.json()["mensaje"])
```

### Ejemplo de Virtual Try-On

```python
# Generar try-on
response = requests.post("http://localhost:10105/tryon/generate", json={
    "id_user": 1,
    "foto_usuario_id": 1,
    "personalizacion_id": 5
})

print(response.json()["imagen_resultado_url"])
```

## 🔑 Configuración de APIs

### OpenAI

1. Crea una cuenta en [OpenAI](https://platform.openai.com)
2. Genera un API key
3. Añádela al `.env`

### Banana

1. Crea una cuenta en [Banana](https://banana.dev)
2. Despliega un modelo de Virtual Try-On (IDM-VTON, OOTD)
3. Obtén tu API key y model key
4. Configúralas en el código

### Cloudinary

1. Crea una cuenta en [Cloudinary](https://cloudinary.com)
2. Obtén tus credenciales del dashboard
3. Añádelas al `.env`

## 📝 Estructura del Proyecto

```
agente IA/
├── app/
│   ├── agents/          # Agentes de Mirascope
│   ├── config/          # Configuración
│   ├── models/          # Modelos SQLAlchemy
│   ├── routes/          # Endpoints FastAPI
│   ├── schemas/         # Schemas Pydantic
│   ├── services/        # Lógica de negocio
│   ├── middleware/      # Middlewares (auth, rate limit)
│   ├── utils/           # Utilidades
│   └── main.py          # Aplicación principal
├── uploads/             # Archivos temporales
├── venv/                # Entorno virtual
├── .env                 # Variables de entorno
├── .gitignore
├── Dockerfile
├── requirements.txt
└── README.md
```

## 📂 Descripción de Archivos

### Archivos Raíz

| Archivo | Descripción |
|---------|-------------|
| `requirements.txt` | Lista de todas las dependencias Python del proyecto (FastAPI, Mirascope, SQLAlchemy, etc.) |
| `.env` | Variables de entorno (API keys, configuración de BD, puertos). **NO subir a git** |
| `.gitignore` | Archivos y carpetas que Git debe ignorar (venv, __pycache__, .env, uploads, etc.) |
| `Dockerfile` | Instrucciones para crear la imagen Docker del microservicio |
| `README.md` | Documentación completa del proyecto |

### app/config/

Archivos de configuración del microservicio:

| Archivo | Descripción |
|---------|-------------|
| `settings.py` | Define todas las variables de configuración usando Pydantic Settings (BD, APIs, puertos). Lee del `.env` |
| `database.py` | Configuración de SQLAlchemy: engine, sesión y función `get_db()` para inyectar la BD en endpoints |
| `storage.py` | Configuración de Cloudinary para subir/eliminar imágenes. Funciones `upload_image()` y `delete_image()` |
| `__init__.py` | Exporta las configuraciones principales para uso en otros módulos |

### app/models/

Modelos de base de datos con SQLAlchemy (representan las tablas):

| Archivo | Descripción |
|---------|-------------|
| `sesion.py` | Modelo `SesionIA` - Sesiones de conversación con el agente (activa/finalizada) |
| `mensaje.py` | Modelo `MensajeIA` - Mensajes del chat (usuario/IA) con metadata para imágenes |
| `imagen.py` | Modelo `Imagen` - Imágenes de diseño subidas (logo, patrón, diseño del usuario) |
| `foto_usuario.py` | Modelo `FotoUsuario` - Fotos del usuario para virtual try-on |
| `prueba_virtual.py` | Modelo `PruebaVirtual` - Resultados de virtual try-on generados |
| `personalizacion.py` | Modelo `Personalizacion` - Personalizaciones de prendas (color, texto, imagen) |
| `__init__.py` | Exporta todos los modelos y enums |

### app/schemas/

Schemas Pydantic para validación de datos (requests/responses):

| Archivo | Descripción |
|---------|-------------|
| `chat.py` | Schemas para chat: `MensajeRequest`, `MensajeResponse`, `SesionCreate`, `ChatResponse` |
| `image.py` | Schemas para imágenes: `ImagenUploadResponse`, `FotoUsuarioCreate`, `FotoUsuarioResponse` |
| `tryon.py` | Schemas para try-on: `TryOnRequest`, `TryOnResponse`, `TryOnFavoritoRequest` |
| `__init__.py` | Exporta todos los schemas |

### app/agents/

Agentes de IA con Mirascope:

| Archivo | Descripción |
|---------|-------------|
| `fashion_agent.py` | **Agente principal** - Función `fashion_agent()` que conversa con el usuario sobre moda y personalización. Usa GPT-4 |
| `fashion_agent.py` | Función `generate_design_prompt()` - Genera prompts optimizados para Stable Diffusion |
| `fashion_agent.py` | Función `analyze_user_image()` - Analiza imágenes subidas por el usuario usando GPT-4 Vision |
| `prompts.py` | Todos los system prompts para diferentes funcionalidades del agente |
| `tools.py` | Herramientas auxiliares: `get_product_info()`, `get_color_recommendations()`, validaciones |
| `__init__.py` | Exporta agentes y prompts |

### app/services/

Lógica de negocio (capa intermedia entre rutas y modelos):

| Archivo | Descripción |
|---------|-------------|
| `agent_service.py` | **Servicio del agente** - Maneja sesiones, mensajes, historial y procesa conversaciones con IA |
| `image_service.py` | **Servicio de imágenes** - Sube/elimina imágenes de diseño y fotos de usuario. Integra Cloudinary |
| `tryon_service.py` | **Servicio de Virtual Try-On** - Genera try-ons usando Banana, marca favoritos |
| `__init__.py` | Exporta todos los servicios |

### app/routes/

Endpoints de la API (rutas de FastAPI):

| Archivo | Descripción |
|---------|-------------|
| `chat.py` | **Rutas de chat** - Crear sesiones, enviar mensajes, obtener historial, cerrar sesión |
| `images.py` | **Rutas de imágenes** - Subir diseños, subir fotos de usuario, listar/eliminar fotos |
| `tryon.py` | **Rutas de try-on** - Generar virtual try-on, listar resultados, marcar favoritos |
| `__init__.py` | Exporta todos los routers |

### app/middleware/ y app/utils/

| Carpeta | Descripción |
|---------|-------------|
| `middleware/` | (Preparada para futuro) Middlewares de autenticación, rate limiting, etc. |
| `utils/` | (Preparada para futuro) Funciones auxiliares, validadores, helpers |

### app/main.py

**Archivo principal** - Crea la aplicación FastAPI, configura CORS, registra todas las rutas y define el servidor.

### uploads/

Carpeta temporal para almacenar imágenes antes de subirlas a Cloudinary. Se elimina el archivo local después de subirlo.

### venv/

Entorno virtual de Python con todas las dependencias instaladas. **NO se sube a git**.

## 🔄 Flujo de Datos

### Chat con el Agente
```
Usuario → POST /chat/session/{id}/message → chat.py (route) 
  → AgentService.process_user_message() → fashion_agent() (Mirascope)
  → OpenAI GPT-4 → Respuesta del agente → Guardar en BD → Usuario
```

### Subir Imagen
```
Usuario → POST /images/design → images.py (route)
  → ImageService.save_user_design_image() → Cloudinary
  → URL de imagen → Guardar en BD → Usuario
```

### Virtual Try-On
```
Usuario → POST /tryon/generate → tryon.py (route)
  → TryOnService.generate_tryon() → Banana API (IDM-VTON)
  → Imagen resultado → Guardar en BD → Usuario
```

## 🤝 Integración con otros microservicios

Este microservicio se comunica con:

- **Personalización** (comparte la misma BD)
- **Catálogo** (obtiene información de productos)
- **Usuarios** (autenticación)

## 🐛 Troubleshooting

### Error de conexión a BD

Verifica que MySQL esté corriendo y las credenciales sean correctas.

### Error con OpenAI

Asegúrate de tener créditos en tu cuenta de OpenAI y que el API key sea válido.

### Imágenes no se suben

Verifica la configuración de Cloudinary o usa almacenamiento local modificando `storage.py`.

## 📄 Licencia

Proyecto SENA - CraftYourStyle
