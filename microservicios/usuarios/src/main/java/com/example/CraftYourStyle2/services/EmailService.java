package com.example.CraftYourStyle2.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Servicio para envío de correos electrónicos
 * 
 * Maneja el envío de:
 * - Correos de verificación de cuenta
 * - Correos de recuperación de contraseña
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Envía un correo de verificación de email al usuario
     * 
     * @param destinatario Email del usuario
     * @param nombre Nombre del usuario
     * @param token Token de verificación
     */
    public void enviarCorreoVerificacion(String destinatario, String nombre, String token) {
        String asunto = "Verifica tu cuenta - CraftYourStyle";
        String enlace = frontendUrl + "/verificar-email?token=" + token;
        
        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333;">¡Hola %s!</h2>
                <p>Gracias por registrarte en CraftYourStyle.</p>
                <p>Por favor, haz clic en el siguiente botón para verificar tu cuenta:</p>
                <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Verificar mi cuenta
                </a>
                <p>O copia y pega el siguiente enlace en tu navegador:</p>
                <p style="color: #666;">%s</p>
                <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
                <br>
                <p>Saludos,<br>El equipo de CraftYourStyle</p>
            </body>
            </html>
            """.formatted(nombre, enlace, enlace);
        
        enviarCorreoHtml(destinatario, asunto, contenido);
    }

    /**
     * Envía un correo para recuperar la contraseña
     * 
     * @param destinatario Email del usuario
     * @param nombre Nombre del usuario
     * @param token Token de recuperación
     */
    public void enviarCorreoRecuperacion(String destinatario, String nombre, String token) {
        String asunto = "Recupera tu contraseña - CraftYourStyle";
        String enlace = frontendUrl + "/restablecer-contrasena?token=" + token;
        
        String contenido = """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333;">Hola %s,</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Restablecer contraseña
                </a>
                <p>O copia y pega el siguiente enlace en tu navegador:</p>
                <p style="color: #666;">%s</p>
                <p><strong>Este enlace expirará en 1 hora.</strong></p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá igual.</p>
                <br>
                <p>Saludos,<br>El equipo de CraftYourStyle</p>
            </body>
            </html>
            """.formatted(nombre, enlace, enlace);
        
        enviarCorreoHtml(destinatario, asunto, contenido);
    }

    /**
     * Método genérico para enviar correos HTML
     */
    private void enviarCorreoHtml(String destinatario, String asunto, String contenidoHtml) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(contenidoHtml, true);
            
            mailSender.send(mensaje);
        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el correo: " + e.getMessage(), e);
        }
    }
}
