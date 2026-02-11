from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base


class PruebaVirtual(Base):
    __tablename__ = "pruebas_virtuales"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_user = Column(Integer, nullable=False)
    foto_usuario_id = Column(Integer, ForeignKey("fotos_usuario.id"), nullable=False)
    personalizacion_id = Column(Integer, nullable=True)
    variant_id = Column(Integer, nullable=True)
    imagen_resultado_url = Column(String(255), nullable=False)
    fecha_generacion = Column(DateTime, default=datetime.utcnow)
    favorito = Column(Boolean, default=False)
    
    # Relaciones
    foto_usuario = relationship("FotoUsuario", back_populates="pruebas_virtuales")
