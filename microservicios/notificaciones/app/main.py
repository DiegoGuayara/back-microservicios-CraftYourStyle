from fastapi import FastAPI
from app.api.routes import router as notificacion_router
from app.core.config import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Notification Microservice 🚀")

app.include_router(notificacion_router)
