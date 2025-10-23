from sqlalchemy import Column, Integer, String, Enum
from app.core.config import Base
import enum

class TipoNotificacion(str, enum.Enum):
    mensaje_texto = "mensaje de texto"
    correo_electronico = "correo electronico"
    push = "push"

class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo_de_notificacion = Column(Enum(TipoNotificacion), nullable=False)
    mensaje = Column(String(250), nullable=False)
