from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas import (
    MensajeRequest,
    SesionCreate,
    SesionResponse,
    ChatResponse,
    MensajeResponse
)
from app.services import AgentService
from typing import List

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/session", response_model=SesionResponse)
async def create_session(
    request: SesionCreate,
    db: Session = Depends(get_db)
):
    """Crea una nueva sesión de chat"""
    sesion = await AgentService.create_session(db, request.id_user)
    return sesion


@router.get("/session/{sesion_id}", response_model=SesionResponse)
async def get_session(
    sesion_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene información de una sesión"""
    sesion = await AgentService.get_session(db, sesion_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return sesion


@router.get("/session/user/{id_user}", response_model=SesionResponse)
async def get_active_session(
    id_user: int,
    db: Session = Depends(get_db)
):
    """Obtiene la sesión activa del usuario"""
    sesion = await AgentService.get_active_session(db, id_user)
    if not sesion:
        raise HTTPException(status_code=404, detail="No hay sesión activa")
    return sesion


@router.post("/session/{sesion_id}/close")
async def close_session(
    sesion_id: int,
    db: Session = Depends(get_db)
):
    """Cierra una sesión de chat"""
    success = await AgentService.close_session(db, sesion_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return {"message": "Sesión cerrada exitosamente"}


@router.get("/session/{sesion_id}/history", response_model=List[MensajeResponse])
async def get_history(
    sesion_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Obtiene el historial de mensajes de una sesión"""
    mensajes = await AgentService.get_conversation_history(db, sesion_id, limit)
    return mensajes


@router.post("/session/{sesion_id}/message", response_model=ChatResponse)
async def send_message(
    sesion_id: int,
    request: MensajeRequest,
    db: Session = Depends(get_db)
):
    """Envía un mensaje al agente y obtiene respuesta"""
    # Verificar que la sesión existe
    sesion = await AgentService.get_session(db, sesion_id)
    if not sesion:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    
    # Procesar mensaje
    respuesta = await AgentService.process_user_message(
        db, sesion_id, request.mensaje, request.imagenes
    )
    
    return ChatResponse(
        sesion_id=sesion_id,
        mensaje=respuesta,
        imagenes_generadas=None  # TODO: Implementar generación de imágenes
    )
