from datetime import datetime, timedelta
from typing import Dict

from sqlalchemy.orm import Session

from app.models import UsoAgenteIA, TipoUsoAgente


class UsageLimitExceededError(Exception):
    def __init__(self, status: Dict[str, object]):
        self.status = status
        reset_at = status["reset_at"].strftime("%Y-%m-%d %H:%M:%S")
        super().__init__(
            f"Has alcanzado el limite de {status['limit']} personalizaciones en 24 horas. "
            f"Podras volver a usar el agente despues de {reset_at}."
        )


class UsageLimitService:
    LIMIT = 5
    WINDOW_HOURS = 24

    @staticmethod
    def _window_start(now: datetime) -> datetime:
        return now - timedelta(hours=UsageLimitService.WINDOW_HOURS)

    @staticmethod
    def _recent_uses_query(db: Session, id_user: int, now: datetime):
        return (
            db.query(UsoAgenteIA)
            .filter(
                UsoAgenteIA.id_user == id_user,
                UsoAgenteIA.created_at >= UsageLimitService._window_start(now),
            )
            .order_by(UsoAgenteIA.created_at.asc())
        )

    @staticmethod
    def get_usage_status(db: Session, id_user: int, now: datetime | None = None) -> Dict[str, object]:
        current_time = now or datetime.utcnow()
        recent_uses = UsageLimitService._recent_uses_query(db, id_user, current_time).all()
        used = len(recent_uses)
        remaining = max(UsageLimitService.LIMIT - used, 0)
        oldest_use = recent_uses[0] if recent_uses else None
        reset_at = (
            oldest_use.created_at + timedelta(hours=UsageLimitService.WINDOW_HOURS)
            if used >= UsageLimitService.LIMIT and oldest_use
            else current_time
        )

        return {
            "limit": UsageLimitService.LIMIT,
            "used": used,
            "remaining": remaining,
            "reset_at": reset_at,
            "window_hours": UsageLimitService.WINDOW_HOURS,
        }

    @staticmethod
    def ensure_usage_available(db: Session, id_user: int) -> Dict[str, object]:
        status = UsageLimitService.get_usage_status(db, id_user)
        if status["remaining"] <= 0:
            raise UsageLimitExceededError(status)
        return status

    @staticmethod
    def register_usage(db: Session, id_user: int, tipo_uso: TipoUsoAgente) -> Dict[str, object]:
        UsageLimitService.ensure_usage_available(db, id_user)
        usage = UsoAgenteIA(id_user=id_user, tipo_uso=tipo_uso)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return UsageLimitService.get_usage_status(db, id_user)
