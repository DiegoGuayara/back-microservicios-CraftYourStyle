"""
Microservicio de Notificaciones - CraftYourStyle

Este microservicio maneja el sistema de notificaciones:
- Creación de notificaciones (mensaje_texto, correo_electrónico, push)
- Consulta de todas las notificaciones registradas
- Base de datos: CraftYourStyle_Notificaciones

Desarrollado con FastAPI y SQLAlchemy ORM
"""

from fastapi import FastAPI
from app.api.routes import router as notificacion_router
from app.core.config import Base, engine

# Crear todas las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Inicializar la aplicación FastAPI
app = FastAPI(title="Notification Microservice 🚀")

# Incluir las rutas de notificaciones
app.include_router(notificacion_router)
