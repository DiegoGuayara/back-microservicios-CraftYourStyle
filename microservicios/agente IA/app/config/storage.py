import cloudinary
import cloudinary.uploader
from app.config.settings import settings

# Configurar Cloudinary
if settings.CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET
    )


async def upload_image(file_path: str, folder: str = "craftyourstyle") -> dict:
    """
    Sube una imagen a Cloudinary
    
    Args:
        file_path: Ruta local del archivo
        folder: Carpeta en Cloudinary
        
    Returns:
        dict con url, public_id, etc.
    """
    try:
        result = cloudinary.uploader.upload(
            file_path,
            folder=folder,
            resource_type="image"
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "width": result.get("width"),
            "height": result.get("height")
        }
    except Exception as e:
        raise Exception(f"Error al subir imagen: {str(e)}")


async def delete_image(public_id: str) -> bool:
    """
    Elimina una imagen de Cloudinary
    
    Args:
        public_id: ID público de la imagen en Cloudinary
        
    Returns:
        True si se eliminó correctamente
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        raise Exception(f"Error al eliminar imagen: {str(e)}")
