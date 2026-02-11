from sqlalchemy import Column, Integer, String
from app.config.database import Base


class Personalizacion(Base):
    __tablename__ = "personalizacion"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    color = Column(String(7), default="#fffff")
    image_url = Column(String(255), nullable=True)
    textos = Column(String(100), nullable=True)
    tipo_letra = Column(String(100), nullable=True)
    variant_id = Column(Integer, nullable=True)
