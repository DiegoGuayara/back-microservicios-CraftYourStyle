"""
Servicio de Notificaciones

Contiene la lógica de negocio para gestionar notificaciones.
Interactúa directamente con la base de datos usando SQLAlchemy ORM.
"""

from sqlalchemy.orm import Session
from app.models.notification import Notificacion
from app.schemas.esquema import NotificacionCreate, TipoNotificacion
from app.core.email_client import enviar_correo

def crear_notificacion(db: Session, data: NotificacionCreate):
    """
    Crea una nueva notificación en la base de datos.
    Si es de tipo correo_electronico y tiene destinatario, envía el correo.
    """
    nueva = Notificacion(**data.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # Si es correo y tiene destinatario, enviar el email
    if data.tipo_de_notificacion == TipoNotificacion.correo_electronico and data.destinatario:
        enviar_correo(
            destinatario=data.destinatario,
            asunto="Factura - CraftYourStyle",
            contenido_html=_generar_html_factura(data.mensaje)
        )

    return nueva


def _generar_html_factura(mensaje: str) -> str:
    """
    Genera un HTML bonito para el correo de factura a partir del mensaje.
    El mensaje viene con formato: 'Campo: valor | Campo: valor | ...'
    """
    partes = [p.strip() for p in mensaje.split("|")]
    filas_html = ""
    for parte in partes:
        if ":" in parte:
            campo, valor = parte.split(":", 1)
            filas_html += f"""
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #555;">{campo.strip()}</td>
                <td style="padding: 8px 12px; color: #333;">{valor.strip()}</td>
            </tr>"""

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                Factura - CraftYourStyle
            </h2>
            <p>Gracias por tu compra. Aquí están los detalles de tu factura:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                {filas_html}
            </table>
            <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
                Este correo fue generado automáticamente por CraftYourStyle.
            </p>
        </div>
    </body>
    </html>
    """

def obtener_notificaciones(db: Session):
    """
    Obtiene todas las notificaciones de la base de datos
    
    Args:
        db: Sesión de SQLAlchemy para interactuar con la BD
    
    Returns:
        list[Notificacion]: Lista con todas las notificaciones registradas
        
    Nota:
        Retorna una lista vacía si no hay notificaciones en la BD
    """
    return db.query(Notificacion).all()
