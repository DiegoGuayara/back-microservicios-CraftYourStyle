# ==================== IMPORTS ====================
# SQLAlchemy - ORM (Object-Relational Mapping) para trabajar con bases de datos
from sqlalchemy import create_engine  # Crea la conexión a la base de datos
from sqlalchemy.ext.declarative import declarative_base  # Clase base para modelos
from sqlalchemy.orm import sessionmaker  # Crea sesiones para interactuar con la BD
from app.config.settings import settings  # Importa la configuración

# ==================== ENGINE DE SQLALCHEMY ====================
# El "engine" es el motor que maneja la conexión a la base de datos
# Es la capa más baja de SQLAlchemy que interactúa directamente con MySQL
engine = create_engine(
    settings.database_url,  # URL de conexión (viene de settings.py)
    pool_pre_ping=True,  # Verifica que la conexión esté viva antes de usarla
    pool_recycle=3600,  # Recicla conexiones cada hora (3600 segundos) para evitar timeouts
    echo=False  # Si es True, imprime todas las consultas SQL (usar solo para debug)
)

# ==================== SESSION MAKER ====================
# SessionLocal es una fábrica que crea sesiones de base de datos
# Una sesión es como una "conversación" con la base de datos
# donde puedes hacer múltiples consultas y luego hacer commit o rollback
SessionLocal = sessionmaker(
    autocommit=False,  # No hace commit automático (tenemos control manual)
    autoflush=False,  # No sincroniza automáticamente cambios con la BD
    bind=engine  # Vincula el session maker con el engine
)

# ==================== BASE DECLARATIVA ====================
# Base es la clase padre de todos nuestros modelos de base de datos
# Todos los modelos (SesionIA, MensajeIA, etc.) heredarán de esta clase
Base = declarative_base()


# ==================== DEPENDENCY INJECTION ====================
def get_db():
    """
    Función generadora que proporciona una sesión de base de datos
    
    Esta función se usa como "dependency" en FastAPI.
    Cada vez que un endpoint necesita acceso a la BD, FastAPI llama a esta función.
    
    Flujo:
    1. Crea una nueva sesión de BD
    2. La "yield" (devuelve) al endpoint que la solicitó
    3. El endpoint usa la sesión para hacer consultas
    4. Al terminar, se ejecuta el "finally" que cierra la sesión
    
    Ejemplo de uso en un endpoint:
    @app.get("/users")
    def get_users(db: Session = Depends(get_db)):
        return db.query(User).all()
    
    Yields:
        Session: Sesión de base de datos lista para usar
    """
    # Crea una nueva sesión
    db = SessionLocal()
    try:
        # Devuelve la sesión al endpoint que la solicitó
        yield db
    finally:
        # Siempre cierra la sesión al terminar (incluso si hay error)
        # Esto previene fugas de memoria y conexiones abiertas
        db.close()
