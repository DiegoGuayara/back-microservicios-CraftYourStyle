from sqlalchemy.orm import Session
from app.models import Imagen, FotoUsuario, TipoImagen
from app.config.storage import upload_image, delete_image
from fastapi import UploadFile
from typing import Optional
import os
import uuid


class ImageService:
    """Servicio para manejo de imágenes"""
    
    @staticmethod
    async def save_user_design_image(
        db: Session,
        file: UploadFile,
        id_user: int,
        variant_id: Optional[int] = None
    ) -> Imagen:
        """
        Guarda una imagen de diseño del usuario
        
        Args:
            db: Sesión de base de datos
            file: Archivo subido
            id_user: ID del usuario
            variant_id: ID de la variante de producto
            
        Returns:
            Imagen guardada
        """
        # Guardar temporalmente
        temp_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        try:
            # Subir a Cloudinary
            result = await upload_image(temp_path, folder=f"users/{id_user}/designs")
            
            # Guardar en BD
            imagen = Imagen(
                image_url=result["url"],
                variant_id=variant_id,
                tipo=TipoImagen.USUARIO_DISEÑO
            )
            db.add(imagen)
            db.commit()
            db.refresh(imagen)
            
            return imagen
        finally:
            # Eliminar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    @staticmethod
    async def save_user_photo(
        db: Session,
        file: UploadFile,
        id_user: int,
        es_principal: bool = False
    ) -> FotoUsuario:
        """
        Guarda una foto del usuario para virtual try-on
        
        Args:
            db: Sesión de base de datos
            file: Archivo subido
            id_user: ID del usuario
            es_principal: Si es la foto principal
            
        Returns:
            FotoUsuario guardada
        """
        # Si es principal, quitar la marca de otras fotos
        if es_principal:
            db.query(FotoUsuario).filter(
                FotoUsuario.id_user == id_user
            ).update({"es_principal": False})
        
        # Guardar temporalmente
        temp_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        try:
            # Subir a Cloudinary
            result = await upload_image(temp_path, folder=f"users/{id_user}/photos")
            
            # Guardar en BD
            foto = FotoUsuario(
                id_user=id_user,
                foto_url=result["url"],
                es_principal=es_principal
            )
            db.add(foto)
            db.commit()
            db.refresh(foto)
            
            return foto
        finally:
            # Eliminar archivo temporal
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    @staticmethod
    async def get_user_photos(db: Session, id_user: int):
        """Obtiene todas las fotos de un usuario"""
        return db.query(FotoUsuario).filter(
            FotoUsuario.id_user == id_user
        ).order_by(FotoUsuario.es_principal.desc()).all()
    
    @staticmethod
    async def delete_user_photo(db: Session, foto_id: int, id_user: int) -> bool:
        """Elimina una foto del usuario"""
        foto = db.query(FotoUsuario).filter(
            FotoUsuario.id == foto_id,
            FotoUsuario.id_user == id_user
        ).first()
        
        if foto:
            db.delete(foto)
            db.commit()
            return True
        return False
