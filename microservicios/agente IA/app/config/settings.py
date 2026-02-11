from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Database
    DB_HOST: str = "localhost"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "CraftYourStyle_Personalizacion"
    DB_PORT: int = 3306
    
    # Server
    PORT: int = 10105
    
    # Gemini (Google AI)
    GEMINI_API_KEY: str
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Banana
    BANANA_API_KEY: Optional[str] = None
    
    # RabbitMQ
    RABBITMQ_HOST: str = "rabbitmq"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASSWORD: str = "guest"
    
    # JWT
    JWT_SECRET: str = "your_jwt_secret_here"
    JWT_ALGORITHM: str = "HS256"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    @property
    def database_url(self) -> str:
        """URL de conexión a MySQL"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


# Instancia global de configuración
settings = Settings()
