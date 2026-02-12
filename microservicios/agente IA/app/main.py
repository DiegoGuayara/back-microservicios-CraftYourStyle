# ==================== IMPORTS ====================
# FastAPI - Framework web moderno y rápido para crear APIs
from fastapi import FastAPI
# CORSMiddleware - Middleware para manejar CORS (Cross-Origin Resource Sharing)
from fastapi.middleware.cors import CORSMiddleware
# Importa todos los routers (grupos de endpoints)
from app.routes import chat_router, images_router, tryon_router
# Importa la configuración de la aplicación
from app.config.settings import settings
# Uvicorn - Servidor ASGI para correr la aplicación FastAPI
import uvicorn

# ==================== CREAR APLICACIÓN FASTAPI ====================
# Crea la instancia principal de la aplicación FastAPI
# Esta aplicación es el punto de entrada de todo el microservicio
app = FastAPI(
    title="CraftYourStyle - AI Agent API",  # Nombre que aparece en la documentación
    description="Microservicio de agente de IA para personalización de moda",  # Descripción
    version="1.0.0"  # Versión del API
)
# FastAPI automáticamente genera documentación en:
# - http://localhost:10105/docs (Swagger UI)
# - http://localhost:10105/redoc (ReDoc)

# ==================== CONFIGURAR CORS ====================
# CORS permite que el frontend (desde otro dominio) pueda hacer peticiones a este API
# Sin CORS, los navegadores bloquearían las peticiones por seguridad
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # "*" permite todos los orígenes (EN PRODUCCIÓN: especificar dominios exactos)
    allow_credentials=True,  # Permite enviar cookies y headers de autenticación
    allow_methods=["*"],  # Permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)
# Ejemplo de configuración segura para producción:
# allow_origins=["https://craftyourstyle.com", "https://app.craftyourstyle.com"]

# ==================== REGISTRAR ROUTERS ====================
# Los routers agrupan endpoints relacionados
# Cada router se define en un archivo separado en app/routes/
app.include_router(chat_router)  # Endpoints de chat: /chat/*
app.include_router(images_router)  # Endpoints de imágenes: /images/*
app.include_router(tryon_router)  # Endpoints de virtual try-on: /tryon/*


# ==================== ENDPOINTS PRINCIPALES ====================
@app.get("/")
async def root():
    """
    Endpoint raíz - Endpoint de bienvenida
    
    Proporciona información básica sobre el API.
    Útil para verificar que el servicio está corriendo.
    
    Returns:
        dict: Información del API
    """
    return {
        "message": "CraftYourStyle AI Agent API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """
    Health Check Endpoint
    
    Usado por sistemas de monitoreo (como Docker, Kubernetes, etc.)
    para verificar que el servicio está "vivo" y funcionando.
    
    Returns:
        dict: Estado de salud del servicio
    """
    return {"status": "healthy"}


# ==================== PUNTO DE ENTRADA ====================
# Este bloque solo se ejecuta si corres el archivo directamente: python app/main.py
# Si importas main.py desde otro archivo, este bloque NO se ejecuta
if __name__ == "__main__":
    # Inicia el servidor Uvicorn
    uvicorn.run(
        "app.main:app",  # Ruta al objeto app (módulo:variable)
        host="0.0.0.0",  # Escucha en todas las interfaces de red (necesario para Docker)
        port=settings.PORT,  # Puerto configurado en .env (10105 por defecto)
        reload=True  # Recarga automáticamente al detectar cambios en el código (solo en desarrollo)
    )
