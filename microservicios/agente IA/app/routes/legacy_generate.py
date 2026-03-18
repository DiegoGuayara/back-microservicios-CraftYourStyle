from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.design_generation_service import DesignGenerationService

router = APIRouter(tags=["Legacy"])


class LegacyGenerateRequest(BaseModel):
    image: str | None = None
    prompt: str
    aspectRatio: str | None = "1:1"
    creativity: float | None = 0.7


def parse_aspect_ratio(value: str | None) -> tuple[int, int]:
    if not value:
        return 1024, 1024

    if value == "1:1":
        return 1024, 1024
    if value == "4:3":
        return 1152, 864
    if value == "3:4":
        return 864, 1152
    if value == "16:9":
        return 1280, 720
    if value == "9:16":
        return 720, 1280

    return 1024, 1024


@router.post("/generate")
async def legacy_generate(payload: LegacyGenerateRequest):
    """
    Endpoint de compatibilidad para clientes legacy que consumen /api/generate.
    """
    if not payload.prompt or not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt es obligatorio")

    try:
        width, height = parse_aspect_ratio(payload.aspectRatio)
        image_url = await DesignGenerationService.generate_design_image(
            prompt=payload.prompt.strip(),
            width=width,
            height=height,
            image_input=payload.image,
            creativity=payload.creativity,
        )

        return {
            "message": "Imagen generada exitosamente",
            "url": image_url,
            "imageUrl": image_url,
            "generatedImage": image_url,
            "data": {
                "url": image_url,
                "imageUrl": image_url,
                "generatedImage": image_url,
                "aspectRatio": payload.aspectRatio,
                "creativity": payload.creativity,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo generar la imagen: {str(e)}")
