"""
Configuración de Base de Datos

Configura la conexión a MySQL usando SQLAlchemy.
Lee variables de entorno para configuración flexible.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Leer configuración de base de datos desde variables de entorno
# Si no existen, usa valores por defecto
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "craftyourstyle_notificaciones")
DB_PORT = os.getenv("DB_PORT", "3306")

# Construir URL de conexión a MySQL
# Formato: mysql+pymysql://usuario:contraseña@host:puerto/nombre_bd
DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Crear el engine de SQLAlchemy
# echo=True muestra los queries SQL en consola (útil para debug)
engine = create_engine(DB_URL, echo=True)

# Crear el SessionLocal para crear sesiones de base de datos
# autocommit=False: Las transacciones se manejan manualmente
# autoflush=False: No hace flush automático antes de queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para definir modelos ORM
Base = declarative_base()
