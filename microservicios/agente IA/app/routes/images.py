from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas import (
    ImagenUploadResponse,
    FotoUsuarioResponse,
    ImagenSaveRequest,
    ImagenSavedResponse,
    ImagenAprobacionRequest,
    ImagenAdminResponse
)
from app.services import ImageService
from app.models import TipoImagen
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


@router.post("/save", response_model=ImagenSavedResponse)
async def save_generated_image(
    payload: ImagenSaveRequest,
    db: Session = Depends(get_db)
):
    """Guarda una imagen generada (URL) en imagenes_ia"""
    try:
        tipo = TipoImagen.USUARIO_DISEÑO
        if payload.tipo:
            try:
                tipo = TipoImagen(payload.tipo)
            except Exception:
                tipo = TipoImagen.USUARIO_DISEÑO

        imagen = await ImageService.save_generated_image_url(
            db,
            id_user=payload.id_user,
            image_url=payload.image_url,
            variant_id=payload.variant_id,
            tipo=tipo,
            prompt=payload.prompt,
            garment_type=payload.garment_type
        )
        return imagen
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar imagen: {str(e)}")


@router.get("/user/{id_user}", response_model=List[ImagenSavedResponse])
async def get_user_designs(
    id_user: int,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Obtiene imágenes guardadas por usuario"""
    try:
        return await ImageService.get_user_designs(db, id_user, estado=estado)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener imágenes: {str(e)}")


@router.delete("/{image_id}")
async def delete_user_design(
    image_id: int,
    id_user: int,
    db: Session = Depends(get_db)
):
    """Elimina una imagen guardada"""
    success = await ImageService.delete_user_design(db, image_id, id_user)
    if not success:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return {"message": "Imagen eliminada exitosamente"}


@router.get("/pending", response_model=List[ImagenAdminResponse])
async def get_pending_designs(db: Session = Depends(get_db)):
    """Lista diseños pendientes de aprobación (admin)."""
    try:
        return await ImageService.get_pending_designs(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener pendientes: {str(e)}")


@router.patch("/{image_id}/approve", response_model=ImagenSavedResponse)
async def approve_design(
    image_id: int,
    payload: ImagenAprobacionRequest,
    db: Session = Depends(get_db)
):
    """Aprueba un diseño y asigna precio."""
    imagen = await ImageService.approve_design(db, image_id, payload.precio)
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return imagen


@router.patch("/{image_id}/reject", response_model=ImagenSavedResponse)
async def reject_design(
    image_id: int,
    db: Session = Depends(get_db)
):
    """Rechaza un diseño."""
    imagen = await ImageService.reject_design(db, image_id)
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return imagen
