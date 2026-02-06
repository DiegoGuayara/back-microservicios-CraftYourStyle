"""
Microservicio de Notificaciones - CraftYourStyle

Este microservicio maneja el sistema de notificaciones:
- Creación de notificaciones (mensaje_texto, correo_electrónico, push)
- Consulta de todas las notificaciones registradas
- Consumo de eventos via RabbitMQ (de Transacciones y Usuarios)
- Base de datos: CraftYourStyle_Notificaciones

Desarrollado con FastAPI y SQLAlchemy ORM
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.routes import router as notificacion_router
from app.core.config import Base, engine
from app.core.rabbitmq import start_consumers_in_background

# Crear todas las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja el ciclo de vida de la aplicación.
    Inicia los consumidores de RabbitMQ al arrancar.
    """
    # Startup: iniciar consumidores de RabbitMQ
    start_consumers_in_background()
    print("🐰 RabbitMQ consumidores iniciados")
    
    yield  # La aplicación se ejecuta aquí
    
    # Shutdown: limpieza si es necesario
    print("🛑 Cerrando microservicio de notificaciones...")


# Inicializar la aplicación FastAPI con lifespan
app = FastAPI(
    title="Notification Microservice 🚀",
    lifespan=lifespan
)

# Incluir las rutas de notificaciones
app.include_router(notificacion_router)


@app.get("/health")
def health_check():
    """Endpoint para verificar que el servicio está funcionando"""
    return {"status": "healthy", "service": "notificaciones"}
