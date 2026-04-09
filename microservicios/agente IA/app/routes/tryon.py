from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas import TryOnRequest, TryOnResponse, TryOnFavoritoRequest
from app.services import TryOnService, UsageLimitExceededError
from typing import List

router = APIRouter(prefix="/tryon", tags=["Virtual Try-On"])


@router.post("/generate", response_model=TryOnResponse)
async def generate_tryon(
    request: TryOnRequest,
    db: Session = Depends(get_db)
):
    """Genera un virtual try-on"""
    try:
        prueba = await TryOnService.generate_tryon(
            db,
            request.id_user,
            request.foto_usuario_id,
            request.personalizacion_id,
            request.variant_id,
            request.garment_image_url,
            request.garment_description,
            request.garment_category,
        )
        return prueba
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UsageLimitExceededError as e:
        raise HTTPException(
            status_code=429,
            detail={
                "message": str(e),
                "limit": e.status["limit"],
                "remaining": e.status["remaining"],
                "reset_at": e.status["reset_at"].isoformat(),
            },
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{id_user}", response_model=List[TryOnResponse])
async def get_user_tryons(
    id_user: int,
    db: Session = Depends(get_db)
):
    """Obtiene todas las pruebas virtuales de un usuario"""
    tryons = await TryOnService.get_user_tryons(db, id_user)
    return tryons


@router.patch("/{prueba_id}/favorite")
async def toggle_favorite(
    prueba_id: int,
    id_user: int,
    request: TryOnFavoritoRequest,
    db: Session = Depends(get_db)
):
    """Marca/desmarca una prueba virtual como favorita"""
    success = await TryOnService.toggle_favorite(db, prueba_id, id_user, request.favorito)
    if not success:
        raise HTTPException(status_code=404, detail="Prueba virtual no encontrada")
    return {"message": "Actualizado exitosamente", "favorito": request.favorito}
