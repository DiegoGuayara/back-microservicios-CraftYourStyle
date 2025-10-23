from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import SessionLocal
from app.schemas.esquema import NotificacionCreate, NotificacionResponse
from app.services.notificacion import crear_notificacion, obtener_notificaciones

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])

# Dependencia para obtener DB en cada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=NotificacionResponse)
def add_notification(notification: NotificacionCreate, db: Session = Depends(get_db)):
    return crear_notificacion(db, notification)

@router.get("/", response_model=list[NotificacionResponse])
def get_all(db: Session = Depends(get_db)):
    return obtener_notificaciones(db)
