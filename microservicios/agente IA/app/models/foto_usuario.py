from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class FotoUsuario(Base):
    __tablename__ = "fotos_usuario"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, nullable=False)
    foto_url = Column(String(255), nullable=False)
    es_principal = Column(Boolean, default=False)
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    
    # Relación con pruebas virtuales
    pruebas_virtuales = relationship("PruebaVirtual", back_populates="foto_usuario")
