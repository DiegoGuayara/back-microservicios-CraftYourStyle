from pydantic import BaseModel
from enum import Enum

class TipoNotificacion(str, Enum):
    mensaje_texto = "mensaje_texto"
    correo_electronico = "correo_electronico"
    push = "push"

class NotificacionCreate(BaseModel):
    tipo_de_notificacion: TipoNotificacion
    mensaje: str

class NotificacionResponse(NotificacionCreate):
    id: int

    class Config:
        from_attributes = True
