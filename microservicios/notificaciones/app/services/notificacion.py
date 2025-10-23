from sqlalchemy.orm import Session
from app.models.notification import Notificacion
from app.schemas.esquema import NotificacionCreate

def crear_notificacion(db: Session, data: NotificacionCreate):
    nueva = Notificacion(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def obtener_notificaciones(db: Session):
    return db.query(Notificacion).all()
