from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Enum, Integer

from app.config.database import Base


class TipoUsoAgente(str, enum.Enum):
    PERSONALIZACION = "personalizacion"
    TRYON = "tryon"


class UsoAgenteIA(Base):
    __tablename__ = "usos_agente_ia"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, nullable=False, index=True)
    tipo_uso = Column(
        Enum(TipoUsoAgente, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
