from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, Numeric
from sqlalchemy.sql import func
from app.config.database import Base
import enum


class TipoImagen(str, enum.Enum):
    PRODUCTO = "producto"
    USUARIO_DISEÑO = "usuario_diseño"
    LOGO = "logo"

class EstadoImagen(str, enum.Enum):
    PENDIENTE = "pendiente"
    APROBADA = "aprobada"
    RECHAZADA = "rechazada"


class Imagen(Base):
    __tablename__ = "imagenes_ia"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, nullable=True)
    image_url = Column(String(255), nullable=False)
    variant_id = Column(Integer, nullable=True)
    tipo = Column(
        Enum(TipoImagen, values_callable=lambda obj: [e.value for e in obj]),
        default=TipoImagen.PRODUCTO
    )
    prompt = Column(Text, nullable=True)
    garment_type = Column(String(50), nullable=True)
    estado = Column(
        Enum(EstadoImagen, values_callable=lambda obj: [e.value for e in obj]),
        default=EstadoImagen.PENDIENTE
    )
    precio = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
