# 📝 Guía Completa de Comentarios del Código

Este documento contiene explicaciones línea por línea de TODOS los archivos del proyecto que aún no han sido comentados directamente en el código.

---

## 📊 MODELOS (app/models/)

### imagen.py

```python
# ==================== IMPORTS ====================
from sqlalchemy import Column, Integer, String, Enum
from app.config.database import Base
import enum


# ==================== ENUM DE TIPO DE IMAGEN ====================
class TipoImagen(str, enum.Enum):
    """
    Enum que define el tipo de imagen
    
    Valores:
    - PRODUCTO: Imagen oficial del producto del catálogo
    - USUARIO_DISEÑO: Diseño personalizado subido por el usuario
    - LOGO: Logo de empresa/marca del usuario
    """
    PRODUCTO = "producto"
    USUARIO_DISEÑO = "usuario_diseño"
    LOGO = "logo"


# ==================== MODELO DE IMAGEN ====================
class Imagen(Base):
    """
    Modelo que representa imágenes asociadas a productos
    
    Puede ser:
    - Imagen del producto base
    - Diseño personalizado del usuario (logo, patrón, etc.)
    - Logo de una empresa
    
    Tabla MySQL: imagenes
    
    Uso:
        # Guardar imagen de diseño del usuario
        imagen = Imagen(
            image_url="https://res.cloudinary.com/abc123.jpg",
            tipo=TipoImagen.LOGO,
            variant_id=5
        )
        db.add(imagen)
        db.commit()
    """
    __tablename__ = "imagenes"
    
    # ID único de la imagen
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # URL de la imagen (normalmente en Cloudinary)
    image_url = Column(String(255), nullable=False)
    
    # ID de la variante de producto a la que pertenece
    # Puede ser NULL si es una imagen sin asociar aún
    variant_id = Column(Integer, nullable=True)
    
    # Tipo de imagen (producto, diseño usuario, logo)
    tipo = Column(Enum(TipoImagen), default=TipoImagen.PRODUCTO)
```

---

### foto_usuario.py

```python
# ==================== IMPORTS ====================
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


# ==================== MODELO DE FOTO DE USUARIO ====================
class FotoUsuario(Base):
    """
    Modelo que representa fotos del usuario para Virtual Try-On
    
    El usuario puede subir múltiples fotos de sí mismo.
    Una de ellas puede marcarse como principal (la que usa por defecto).
    
    Tabla MySQL: fotos_usuario
    
    Relaciones:
    - Una foto puede usarse en múltiples pruebas virtuales
    
    Uso:
        # Guardar nueva foto del usuario
        foto = FotoUsuario(
            id_user=1,
            foto_url="https://cloudinary.com/user1/foto1.jpg",
            es_principal=True
        )
        db.add(foto)
        db.commit()
        
        # Obtener foto principal del usuario
        foto_principal = db.query(FotoUsuario).filter(
            FotoUsuario.id_user == 1,
            FotoUsuario.es_principal == True
        ).first()
    """
    __tablename__ = "fotos_usuario"
    
    # ID único de la foto
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # ID del usuario dueño de la foto
    id_user = Column(Integer, nullable=False)
    
    # URL de la foto almacenada en Cloudinary
    foto_url = Column(String(255), nullable=False)
    
    # Indica si es la foto principal del usuario
    # Solo una foto por usuario debe tener es_principal=True
    es_principal = Column(Boolean, default=False)
    
    # Fecha en que se subió la foto
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    
    # Relación con pruebas virtuales
    # Una foto puede usarse en múltiples try-ons
    pruebas_virtuales = relationship(
        "PruebaVirtual",
        back_populates="foto_usuario"
    )
```

---

### prueba_virtual.py

```python
# ==================== IMPORTS ====================
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


# ==================== MODELO DE PRUEBA VIRTUAL ====================
class PruebaVirtual(Base):
    """
    Modelo que representa un Virtual Try-On generado
    
    Almacena el resultado de aplicar una prenda/personalización
    sobre la foto de un usuario usando IA (Banana/IDM-VTON).
    
    Tabla MySQL: pruebas_virtuales
    
    Relaciones:
    - Pertenece a una foto de usuario (many-to-one)
    
    Uso:
        # Crear resultado de try-on
        prueba = PruebaVirtual(
            id_user=1,
            foto_usuario_id=5,
            personalizacion_id=3,
            variant_id=10,
            imagen_resultado_url="https://cloudinary.com/result.jpg"
        )
        db.add(prueba)
        db.commit()
        
        # Marcar como favorito
        prueba.favorito = True
        db.commit()
    """
    __tablename__ = "pruebas_virtuales"
    
    # ID único de la prueba virtual
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # ID del usuario que generó la prueba
    id_user = Column(Integer, nullable=False)
    
    # ID de la foto del usuario que se usó
    # ForeignKey conecta con fotos_usuario
    foto_usuario_id = Column(
        Integer,
        ForeignKey("fotos_usuario.id"),
        nullable=False
    )
    
    # ID de la personalización aplicada (puede ser NULL)
    personalizacion_id = Column(Integer, nullable=True)
    
    # ID de la variante del producto probado (puede ser NULL)
    variant_id = Column(Integer, nullable=True)
    
    # URL de la imagen resultante (usuario con la prenda puesta)
    # Esta imagen fue generada por el modelo de ML
    imagen_resultado_url = Column(String(255), nullable=False)
    
    # Fecha en que se generó la prueba
    fecha_generacion = Column(DateTime, default=datetime.utcnow)
    
    # Indica si el usuario marcó esta prueba como favorita
    favorito = Column(Boolean, default=False)
    
    # Relación con la foto del usuario
    foto_usuario = relationship(
        "FotoUsuario",
        back_populates="pruebas_virtuales"
    )
```

---

### personalizacion.py

```python
# ==================== IMPORTS ====================
from sqlalchemy import Column, Integer, String
from app.config.database import Base


# ==================== MODELO DE PERSONALIZACIÓN ====================
class Personalizacion(Base):
    """
    Modelo que representa una personalización de prenda
    
    Almacena cómo el usuario quiere personalizar una prenda:
    - Color
    - Imagen/logo
    - Texto
    - Tipo de letra
    
    Tabla MySQL: personalizacion
    
    Uso:
        # Crear personalización
        personalizacion = Personalizacion(
            color="#FF5733",
            image_url="https://cloudinary.com/logo.png",
            textos="Mi Empresa",
            tipo_letra="Arial",
            variant_id=5
        )
        db.add(personalizacion)
        db.commit()
    """
    __tablename__ = "personalizacion"
    
    # ID único de la personalización
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Color en formato hexadecimal (ej: #FF0000 para rojo)
    # Por defecto es blanco (#FFFFFF)
    color = Column(String(7), default="#fffff")
    
    # URL de la imagen/logo a aplicar (puede ser NULL)
    image_url = Column(String(255), nullable=True)
    
    # Texto a imprimir en la prenda (puede ser NULL)
    # Ejemplo: "Mi Empresa", "Team 2024", etc.
    textos = Column(String(100), nullable=True)
    
    # Tipo de letra/fuente para el texto
    # Ejemplo: "Arial", "Helvetica", "Comic Sans", etc.
    tipo_letra = Column(String(100), nullable=True)
    
    # ID de la variante de producto a personalizar
    variant_id = Column(Integer, nullable=True)
```

---

## ✅ SCHEMAS (app/schemas/)

Los schemas ya están bien estructurados, pero aquí están los comentarios adicionales:

### chat.py - Comentarios adicionales

```python
"""
Schemas de Pydantic para validación de datos del chat

Pydantic valida automáticamente:
- Tipos de datos correctos
- Campos requeridos vs opcionales
- Formatos (emails, URLs, etc.)

Si los datos no son válidos, FastAPI responde automáticamente
con error 422 Unprocessable Entity
"""

class MensajeRequest(BaseModel):
    """
    Schema para recibir un mensaje del usuario
    
    Se usa en el endpoint POST /chat/session/{id}/message
    
    Campos:
    - mensaje: El texto que el usuario envía (obligatorio)
    - imagenes: Lista de URLs de imágenes adjuntas (opcional)
    
    Ejemplo JSON:
    {
        "mensaje": "Quiero una camiseta con un león",
        "imagenes": ["https://cloudinary.com/logo.jpg"]
    }
    """
    mensaje: str = Field(..., description="Contenido del mensaje")
    imagenes: Optional[List[str]] = Field(None, description="URLs de imágenes adjuntas")


class ChatResponse(BaseModel):
    """
    Schema para responder al usuario después de procesar su mensaje
    
    Campos:
    - sesion_id: ID de la sesión actual
    - mensaje: Respuesta generada por el agente de IA
    - imagenes_generadas: URLs de imágenes generadas (ej: diseños)
    
    Ejemplo JSON:
    {
        "sesion_id": 1,
        "mensaje": "¡Genial! Un león queda perfecto en una camiseta...",
        "imagenes_generadas": ["https://cloudinary.com/diseño1.jpg"]
    }
    """
    sesion_id: int
    mensaje: str
    imagenes_generadas: Optional[List[str]] = None
```

---

## 🤖 AGENTES (app/agents/)

### fashion_agent.py - Explicación detallada

```python
"""
Agentes de IA con Mirascope

Mirascope es un framework que simplifica la creación de agentes de IA.
Ventajas:
- Prompts estructurados y reutilizables
- Soporte para múltiples modelos (OpenAI, Anthropic, Google, etc.)
- Manejo automático de tokens y costos
- Type safety con Python
"""

from mirascope.core import openai, prompt_template
from mirascope.core.openai import OpenAICallResponse
from typing import List, Optional
from app.config.settings import settings


# ==================== AGENTE PRINCIPAL ====================
@openai.call(model="gpt-4o", client=None)
@prompt_template(
    """
    SYSTEM:
    Eres un asistente de IA experto en moda y personalización de prendas para CraftYourStyle.
    
    Tus responsabilidades son:
    1. Ayudar a los usuarios a personalizar prendas (añadir diseños, logos, texto)
    2. Sugerir combinaciones de colores y estilos
    3. Recomendar outfits completos
    4. Procesar imágenes que el usuario envía para personalización
    5. Guiar en el proceso de virtual try-on
    
    Debes ser:
    - Amigable y creativo
    - Claro en tus explicaciones
    - Proactivo sugiriendo ideas
    - Experto en tendencias de moda
    
    Contexto del usuario:
    {context}
    
    USER:
    {user_message}
    """
)
async def fashion_agent(
    user_message: str,
    context: Optional[str] = None
) -> OpenAICallResponse:
    """
    Agente principal de moda y personalización
    
    Este es el "cerebro" del agente. Recibe mensajes del usuario
    y genera respuestas inteligentes usando GPT-4.
    
    Args:
        user_message: El mensaje actual del usuario
        context: Contexto adicional (historial, imágenes analizadas, etc.)
        
    Returns:
        OpenAICallResponse: Objeto con la respuesta de GPT-4
        
    Flujo:
    1. Mirascope construye el prompt con el template
    2. Inserta user_message y context en el template
    3. Envía el prompt a OpenAI GPT-4
    4. Recibe y devuelve la respuesta
    
    Ejemplo:
        response = await fashion_agent(
            user_message="Quiero una camiseta con mi logo",
            context="Usuario: Juan, Sesión: 1, Mensajes previos: 3"
        )
        print(response.content)  # La respuesta de GPT-4
    """
    pass  # Mirascope maneja todo automáticamente


# ==================== GENERADOR DE PROMPTS PARA DISEÑOS ====================
@openai.call(model="gpt-4o", client=None)
@prompt_template(
    """
    SYSTEM:
    Eres un experto en describir diseños para prendas de vestir.
    Genera descripciones detalladas en inglés para modelos de generación de imágenes (Stable Diffusion).
    
    La descripción debe ser técnica y específica, incluyendo:
    - Tipo de prenda
    - Colores
    - Estilo del diseño
    - Posición del diseño
    - Detalles adicionales
    
    USER:
    El usuario quiere: {user_request}
    Tipo de prenda: {garment_type}
    """
)
async def generate_design_prompt(
    user_request: str,
    garment_type: str = "camiseta"
) -> OpenAICallResponse:
    """
    Genera un prompt optimizado para Stable Diffusion
    
    Convierte la solicitud del usuario en un prompt técnico
    para generar imágenes con modelos de ML.
    
    Args:
        user_request: Lo que el usuario quiere (ej: "un león rugiendo")
        garment_type: Tipo de prenda (ej: "camiseta", "sudadera")
        
    Returns:
        Prompt optimizado para Stable Diffusion
        
    Ejemplo:
        Input: "Quiero un león"
        Output: "t-shirt with detailed lion roaring, 
                 high quality, 4k, centered design, 
                 professional print style"
    """
    pass


# ==================== ANALIZADOR DE IMÁGENES ====================
@openai.call(model="gpt-4o-mini", client=None)
@prompt_template(
    """
    SYSTEM:
    Analiza la siguiente imagen y describe qué ves.
    Enfócate en elementos que puedan ser utilizados para personalizar prendas:
    - Logos
    - Patrones
    - Colores dominantes
    - Estilo visual
    
    USER:
    {image_url:image}
    
    Describe esta imagen en detalle para que pueda ser usada en personalización de prendas.
    """
)
async def analyze_user_image(image_url: str) -> OpenAICallResponse:
    """
    Analiza una imagen subida por el usuario usando GPT-4 Vision
    
    GPT-4 puede "ver" imágenes y describirlas en texto.
    Esto permite al agente entender qué tipo de diseño quiere el usuario.
    
    Args:
        image_url: URL de la imagen a analizar
        
    Returns:
        Descripción detallada de la imagen
        
    Ejemplo:
        Input: URL de imagen con un logo de león
        Output: "La imagen muestra un logo de león en estilo minimalista,
                 con líneas negras sobre fondo blanco. El león está de perfil
                 con una expresión seria. Estilo: moderno y profesional."
    """
    pass
```

---

## 🔧 SERVICIOS (app/services/)

### agent_service.py - Explicación línea por línea

```python
"""
Servicio del Agente de IA

Este servicio contiene TODA la lógica del chat:
- Crear y gestionar sesiones
- Guardar mensajes
- Procesar contexto e historial
- Llamar al agente de IA
- Guardar respuestas

Separa la lógica de negocio de los endpoints (routes).
Los endpoints solo llaman a estos métodos.
"""

from sqlalchemy.orm import Session
from app.models import SesionIA, MensajeIA, TipoMensaje, EstadoSesion
from app.agents import fashion_agent, analyze_user_image
from typing import List, Optional, Dict
from datetime import datetime


class AgentService:
    """Servicio para manejar la lógica del agente de IA"""
    
    @staticmethod
    async def create_session(db: Session, id_user: int) -> SesionIA:
        """
        Crea una nueva sesión de chat
        
        Args:
            db: Sesión de base de datos
            id_user: ID del usuario
            
        Returns:
            SesionIA: La sesión creada
            
        Flujo:
        1. Crea objeto SesionIA
        2. Lo guarda en la BD
        3. Hace commit (guarda permanentemente)
        4. Hace refresh (carga el ID generado automáticamente)
        5. Devuelve la sesión
        """
        sesion = SesionIA(id_user=id_user)
        db.add(sesion)
        db.commit()
        db.refresh(sesion)
        return sesion
    
    @staticmethod
    async def process_user_message(
        db: Session,
        sesion_id: int,
        user_message: str,
        imagenes: Optional[List[str]] = None
    ) -> str:
        """
        Procesa un mensaje del usuario y genera respuesta del agente
        
        Este es el método MÁS IMPORTANTE del servicio.
        Coordina todo el flujo de procesamiento de un mensaje.
        
        Args:
            db: Sesión de base de datos
            sesion_id: ID de la sesión actual
            user_message: Mensaje del usuario
            imagenes: URLs de imágenes adjuntas (opcional)
            
        Returns:
            str: Respuesta generada por el agente
            
        Flujo completo:
        1. Guardar mensaje del usuario en BD
        2. Obtener historial de mensajes anteriores (para contexto)
        3. Si hay imágenes adjuntas:
           a. Analizar cada imagen con GPT-4 Vision
           b. Agregar análisis al contexto
        4. Construir el contexto completo (historial + análisis)
        5. Llamar al agente de IA con el mensaje y contexto
        6. Guardar respuesta del agente en BD
        7. Devolver la respuesta
        """
        # PASO 1: Guardar mensaje del usuario
        metadata = {"imagenes": imagenes} if imagenes else None
        await AgentService.save_message(
            db, sesion_id, TipoMensaje.USUARIO, user_message, metadata
        )
        
        # PASO 2: Obtener historial (últimos 5 mensajes)
        historial = await AgentService.get_conversation_history(
            db, sesion_id, limit=5
        )
        historial.reverse()  # Ordenar cronológicamente
        
        # PASO 3: Construir contexto del historial
        context = "\n".join([
            f"{'Usuario' if msg.tipo == TipoMensaje.USUARIO else 'Asistente'}: {msg.contenido}"
            for msg in historial[:-1]  # Excluir mensaje actual
        ]) if len(historial) > 1 else "Primera interacción"
        
        # PASO 4: Analizar imágenes si las hay
        if imagenes:
            image_analyses = []
            for img_url in imagenes:
                try:
                    # Llamar a GPT-4 Vision para analizar la imagen
                    analysis = await analyze_user_image(img_url)
                    image_analyses.append(analysis.content)
                except Exception as e:
                    image_analyses.append(f"No se pudo analizar: {str(e)}")
            
            # Agregar análisis de imágenes al contexto
            context += "\n\nImágenes adjuntas:\n" + "\n".join(image_analyses)
        
        # PASO 5: Llamar al agente de IA
        try:
            response = await fashion_agent(user_message, context)
            respuesta_texto = response.content
        except Exception as e:
            # Si hay error, devolver mensaje de error amigable
            respuesta_texto = f"Lo siento, hubo un error: {str(e)}"
        
        # PASO 6: Guardar respuesta del agente
        await AgentService.save_message(
            db, sesion_id, TipoMensaje.IA, respuesta_texto
        )
        
        # PASO 7: Devolver respuesta
        return respuesta_texto
```

---

## 🛣️ RUTAS (app/routes/)

### chat.py - Explicación de endpoints

```python
"""
Rutas/Endpoints del chat

Cada función decorada con @router es un endpoint HTTP.
FastAPI convierte estas funciones en endpoints reales.

Parámetros comunes:
- Path parameters: {sesion_id} en la URL
- Query parameters: ?limit=10
- Body: JSON en el cuerpo de la petición
- Dependencies: Depends(get_db) inyecta la BD
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas import MensajeRequest, SesionCreate, ChatResponse
from app.services import AgentService


# Crear router con prefijo /chat
# Todos los endpoints empezarán con /chat/...
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/session/{sesion_id}/message", response_model=ChatResponse)
async def send_message(
    sesion_id: int,  # Path parameter: viene de la URL
    request: MensajeRequest,  # Body: JSON que Pydantic valida automáticamente
    db: Session = Depends(get_db)  # Dependency injection: FastAPI inyecta la BD
):
    """
    Envía un mensaje al agente y obtiene respuesta
    
    Endpoint: POST /chat/session/{sesion_id}/message
    
    Request Body (JSON):
    {
        "mensaje": "Quiero una camiseta azul",
        "imagenes": ["https://..."]  // opcional
    }
    
    Response (JSON):
    {
        "sesion_id": 1,
        "mensaje": "¡Perfecto! El azul es un color muy versátil...",
        "imagenes_generadas": null
    }
    
    Flujo:
    1. FastAPI recibe la petición HTTP
    2. Valida el JSON con MensajeRequest (Pydantic)
    3. Inyecta la sesión de BD con get_db()
    4. Ejecuta esta función
    5. Si todo va bien, serializa la respuesta a JSON
    6. Si hay error, FastAPI maneja el HTTPException automáticamente
    """
    # Verificar que la sesión existe
    sesion = await AgentService.get_session(db, sesion_id)
    if not sesion:
        # HTTPException genera automáticamente una respuesta 404
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Procesar el mensaje (aquí está toda la magia)
    respuesta = await AgentService.process_user_message(
        db, sesion_id, request.mensaje, request.imagenes
    )
    
    # Devolver respuesta (FastAPI lo convierte automáticamente a JSON)
    return ChatResponse(
        sesion_id=sesion_id,
        mensaje=respuesta,
        imagenes_generadas=None
    )
```

---

## 📄 ARCHIVOS DE SOPORTE

### __init__.py

Todos los archivos `__init__.py` sirven para:
1. Convertir una carpeta en un paquete Python
2. Exportar clases/funciones para facilitar imports

```python
# app/models/__init__.py
"""
Hace que models/ sea un paquete Python
Exporta todos los modelos para imports más limpios

Sin esto:
from app.models.sesion import SesionIA
from app.models.mensaje import MensajeIA

Con esto:
from app.models import SesionIA, MensajeIA
"""

from .sesion import SesionIA, EstadoSesion
from .mensaje import MensajeIA, TipoMensaje
# ... más imports

__all__ = ["SesionIA", "EstadoSesion", "MensajeIA", ...]


# app/routes/__init__.py
"""
Exporta todos los routers
"""
from .chat import router as chat_router
from .images import router as images_router
from .tryon import router as tryon_router

__all__ = ["chat_router", "images_router", "tryon_router"]
```

---

## 🎯 Conceptos Clave

### 1. Dependency Injection (FastAPI)

```python
# get_db() es una dependency
def get_db():
    db = SessionLocal()
    try:
        yield db  # "Presta" la BD al endpoint
    finally:
        db.close()  # Siempre cierra al terminar

# FastAPI la inyecta automáticamente
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    # db ya está lista para usar
    return db.query(User).all()
```

### 2. Async/Await

```python
# async def: Función asíncrona
# await: Espera a que termine una operación asíncrona

async def send_message():
    # await "pausa" la función hasta que termine fashion_agent()
    # Mientras tanto, FastAPI puede procesar otras peticiones
    response = await fashion_agent(mensaje)
    return response
```

### 3. Type Hints

```python
# Los : tipo indican qué tipo debe ser cada variable
def suma(a: int, b: int) -> int:
    return a + b

# Beneficios:
# - El IDE te ayuda con autocompletado
# - Detecta errores antes de ejecutar
# - Documentación automática
```

### 4. Pydantic Models

```python
class MensajeRequest(BaseModel):
    mensaje: str  # Obligatorio
    imagenes: Optional[List[str]] = None  # Opcional

# Pydantic valida automáticamente:
request = MensajeRequest(mensaje="hola", imagenes=["url1"])  # ✅
request = MensajeRequest()  # ❌ Error: falta mensaje
request = MensajeRequest(mensaje=123)  # ❌ Error: debe ser string
```

---

## 🔄 Flujo Completo Explicado

### Usuario envía: "Quiero una camiseta con un león"

**1. FastAPI recibe HTTP POST** → `/chat/session/1/message`
```json
{
  "mensaje": "Quiero una camiseta con un león",
  "imagenes": ["https://cloudinary.com/leon.jpg"]
}
```

**2. Pydantic valida** → MensajeRequest
- ✅ mensaje es string
- ✅ imagenes es lista de strings

**3. FastAPI inyecta BD** → get_db()
- Crea sesión de MySQL
- Se la pasa al endpoint

**4. Endpoint llama al servicio** → AgentService.process_user_message()

**5. Servicio guarda mensaje** → INSERT en mensajes_ia

**6. Servicio obtiene historial** → SELECT últimos 5 mensajes

**7. Servicio analiza imagen** → analyze_user_image()
- Llama a GPT-4 Vision
- Respuesta: "Logo de león minimalista, negro sobre blanco"

**8. Servicio construye contexto**:
```
Usuario: Hola
Asistente: ¡Hola! ¿En qué puedo ayudarte?
Usuario: Quiero una camiseta con un león

Imágenes adjuntas:
Logo de león minimalista, negro sobre blanco
```

**9. Servicio llama al agente** → fashion_agent()
- Mirascope construye el prompt
- Envía a GPT-4
- Recibe respuesta

**10. Servicio guarda respuesta** → INSERT en mensajes_ia

**11. Endpoint devuelve JSON**:
```json
{
  "sesion_id": 1,
  "mensaje": "¡Excelente elección! Un león queda perfecto...",
  "imagenes_generadas": null
}
```

**12. FastAPI envía HTTP 200 OK** → Usuario recibe respuesta

---

## 📚 Resumen de Responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Models** | Representar tablas de BD | `SesionIA`, `MensajeIA` |
| **Schemas** | Validar datos entrada/salida | `MensajeRequest`, `ChatResponse` |
| **Agents** | Inteligencia artificial | `fashion_agent()`, `analyze_user_image()` |
| **Services** | Lógica de negocio | `AgentService.process_user_message()` |
| **Routes** | Endpoints HTTP | `POST /chat/session/{id}/message` |
| **Config** | Configuración | `settings`, `database`, `storage` |

---

¡Ahora tienes una comprensión completa de cada parte del código! 🚀
