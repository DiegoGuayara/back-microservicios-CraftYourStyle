from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat_router, images_router, tryon_router
from app.config.settings import settings
import uvicorn

# Crear aplicación FastAPI
app = FastAPI(
    title="CraftYourStyle - AI Agent API",
    description="Microservicio de agente de IA para personalización de moda",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(chat_router)
app.include_router(images_router)
app.include_router(tryon_router)


@app.get("/")
async def root():
    """Endpoint de bienvenida"""
    return {
        "message": "CraftYourStyle AI Agent API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
