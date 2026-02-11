from sqlalchemy import Column, Integer, String, Enum
from app.config.database import Base
import enum


class TipoImagen(str, enum.Enum):
    PRODUCTO = "producto"
    USUARIO_DISEÑO = "usuario_diseño"
    LOGO = "logo"


class Imagen(Base):
    __tablename__ = "imagenes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    image_url = Column(String(255), nullable=False)
    variant_id = Column(Integer, nullable=True)
    tipo = Column(Enum(TipoImagen), default=TipoImagen.PRODUCTO)
