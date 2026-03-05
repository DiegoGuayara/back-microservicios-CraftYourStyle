"""
Cliente de Email (SMTP)

Envía correos electrónicos usando Gmail SMTP.
Usa las variables de entorno MAIL_USERNAME y MAIL_PASSWORD.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

MAIL_HOST = os.getenv("MAIL_HOST", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")


def enviar_correo(destinatario: str, asunto: str, contenido_html: str) -> bool:
    """
    Envía un correo electrónico vía SMTP.

    Args:
        destinatario: Email del destinatario
        asunto: Asunto del correo
        contenido_html: Contenido HTML del correo

    Returns:
        True si se envió correctamente, False si falló
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        print("⚠️ MAIL_USERNAME o MAIL_PASSWORD no configurados. No se puede enviar correo.")
        return False

    try:
        mensaje = MIMEMultipart("alternative")
        mensaje["From"] = MAIL_USERNAME
        mensaje["To"] = destinatario
        mensaje["Subject"] = asunto
        mensaje.attach(MIMEText(contenido_html, "html", "utf-8"))

        with smtplib.SMTP(MAIL_HOST, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_USERNAME, destinatario, mensaje.as_string())

        print(f"✅ Correo enviado a {destinatario}")
        return True

    except Exception as e:
        print(f"❌ Error enviando correo a {destinatario}: {e}")
        return False