# ==================== IMPORTS ====================
# BaseSettings: Clase base de Pydantic para manejar configuración
# SettingsConfigDict: Para configurar cómo se leen las variables de entorno
from pydantic_settings import BaseSettings, SettingsConfigDict
# Optional: Indica que un valor puede ser None
from typing import Optional


class Settings(BaseSettings):
    """
    Clase de configuración de la aplicación
    
    Esta clase define todas las variables de configuración necesarias para el microservicio.
    Pydantic lee automáticamente las variables del archivo .env y las valida.
    
    Ventajas:
    - Validación automática de tipos
    - Valores por defecto
    - Centraliza toda la configuración en un solo lugar
    """
    
    # ==================== CONFIGURACIÓN DE BASE DE DATOS ====================
    # Estas variables definen cómo conectarse a la base de datos MySQL
    
    DB_HOST: str = "localhost"  # Host donde corre MySQL (localhost en desarrollo)
    DB_USER: str = "root"  # Usuario de la base de datos
    DB_PASSWORD: str = ""  # Contraseña (vacía por defecto en desarrollo)
    DB_NAME: str = "CraftYourStyle_Personalizacion"  # Nombre de la base de datos
    DB_PORT: int = 3306  # Puerto de MySQL (3306 es el estándar)
    
    # ==================== CONFIGURACIÓN DEL SERVIDOR ====================
    PORT: int = 10105  # Puerto en el que escucha este microservicio
    
    # ==================== API DE INTELIGENCIA ARTIFICIAL ====================
    # Gemini (Google AI) - Para el agente conversacional de IA
    GEMINI_API_KEY: str  # API key de Google Gemini (obligatorio)
    IMAGEN_MODEL: str = "imagen-4.0-generate-001"  # Modelo por defecto para generación de imágenes
    IMAGEN_FALLBACK_MODELS: str = "imagen-4.0-fast-generate-001,imagen-3.0-generate-002"  # Fallbacks separados por coma
    
    # ==================== ALMACENAMIENTO DE IMÁGENES ====================
    # Cloudinary - Servicio en la nube para almacenar imágenes
    # Usado para guardar fotos de usuarios y diseños personalizados
    CLOUDINARY_CLOUD_NAME: Optional[str] = None  # Nombre de tu cloud
    CLOUDINARY_API_KEY: Optional[str] = None  # Tu API key
    CLOUDINARY_API_SECRET: Optional[str] = None  # Tu API secret
    
    # ==================== MODELOS DE MACHINE LEARNING ====================
    # Banana - Plataforma para ejecutar modelos de ML
    # Usado para Virtual Try-On (probarse prendas virtualmente)
    BANANA_API_KEY: Optional[str] = None  # API key de Banana
    
    # ==================== MENSAJERÍA ENTRE MICROSERVICIOS ====================
    # RabbitMQ - Sistema de colas para comunicación asíncrona entre microservicios
    RABBITMQ_HOST: str = "rabbitmq"  # Host (nombre del servicio en Docker)
    RABBITMQ_PORT: int = 5672  # Puerto estándar de RabbitMQ
    RABBITMQ_USER: str = "guest"  # Usuario por defecto
    RABBITMQ_PASSWORD: str = "guest"  # Contraseña por defecto
    
    # ==================== AUTENTICACIÓN JWT ====================
    # JSON Web Tokens - Para autenticar usuarios
    JWT_SECRET: str = "your_jwt_secret_here"  # Clave secreta (cambiar en producción)
    JWT_ALGORITHM: str = "HS256"  # Algoritmo de encriptación
    
    # ==================== CONFIGURACIÓN DE PYDANTIC ====================
    model_config = SettingsConfigDict(
        env_file=".env",  # Lee variables del archivo .env
        case_sensitive=True  # Las variables distinguen mayúsculas/minúsculas
    )
    
    @property
    def database_url(self) -> str:
        """
        Genera la URL de conexión a MySQL en el formato que SQLAlchemy necesita
        
        Formato: mysql+pymysql://usuario:contraseña@host:puerto/base_datos
        - mysql+pymysql: Indica que usamos el driver PyMySQL para MySQL
        - usuario:contraseña: Credenciales de acceso
        - host:puerto: Dónde está el servidor MySQL
        - base_datos: Nombre de la base de datos
        
        Returns:
            str: URL completa de conexión
        """
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# ==================== INSTANCIA GLOBAL ====================
# Crea una instancia única de Settings que se usará en toda la aplicación
# Al crearla, Pydantic automáticamente lee el archivo .env y carga todas las variables
settings = Settings()

