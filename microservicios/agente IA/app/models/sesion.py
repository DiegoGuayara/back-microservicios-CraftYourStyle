from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base
import enum


class EstadoSesion(str, enum.Enum):
    ACTIVA = "activa"
    FINALIZADA = "finalizada"


class SesionIA(Base):
    __tablename__ = "sesiones_ia"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_fin = Column(DateTime, nullable=True)
    estado = Column(Enum(EstadoSesion), default=EstadoSesion.ACTIVA)
    
    # Relación con mensajes
    mensajes = relationship("MensajeIA", back_populates="sesion", cascade="all, delete-orphan")
