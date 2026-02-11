from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base
import enum


class TipoMensaje(str, enum.Enum):
    USUARIO = "usuario"
    IA = "ia"


class MensajeIA(Base):
    __tablename__ = "mensajes_ia"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sesion_id = Column(Integer, ForeignKey("sesiones_ia.id"), nullable=False)
    tipo = Column(Enum(TipoMensaje), nullable=False)
    contenido = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)  # Para imágenes adjuntas, etc.
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relación con sesión
    sesion = relationship("SesionIA", back_populates="mensajes")
