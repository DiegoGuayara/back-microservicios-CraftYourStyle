from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas import ImagenUploadResponse, FotoUsuarioResponse
from app.services import ImageService
from typing import List, Optional

router = APIRouter(prefix="/images", tags=["Images"])


@router.post("/design", response_model=ImagenUploadResponse)
async def upload_design_image(
    file: UploadFile = File(...),
    id_user: int = Form(...),
    variant_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Sube una imagen de diseño del usuario"""
    # Validar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    try:
        imagen = await ImageService.save_user_design_image(db, file, id_user, variant_id)
        return ImagenUploadResponse(
            id=imagen.id,
            url=imagen.image_url,
            tipo=imagen.tipo.value
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")


@router.post("/photo", response_model=FotoUsuarioResponse)
async def upload_user_photo(
    file: UploadFile = File(...),
    id_user: int = Form(...),
    es_principal: bool = Form(False),
    db: Session = Depends(get_db)
):
    """Sube una foto del usuario para virtual try-on"""
    # Validar tipo de archivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    try:
        foto = await ImageService.save_user_photo(db, file, id_user, es_principal)
        return foto
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir foto: {str(e)}")


@router.get("/photos/{id_user}", response_model=List[FotoUsuarioResponse])
async def get_user_photos(
    id_user: int,
    db: Session = Depends(get_db)
):
    """Obtiene todas las fotos de un usuario"""
    fotos = await ImageService.get_user_photos(db, id_user)
    return fotos


@router.delete("/photo/{foto_id}")
async def delete_photo(
    foto_id: int,
    id_user: int,
    db: Session = Depends(get_db)
):
    """Elimina una foto del usuario"""
    success = await ImageService.delete_user_photo(db, foto_id, id_user)
    if not success:
        raise HTTPException(status_code=404, detail="Foto no encontrada")
    return {"message": "Foto eliminada exitosamente"}
