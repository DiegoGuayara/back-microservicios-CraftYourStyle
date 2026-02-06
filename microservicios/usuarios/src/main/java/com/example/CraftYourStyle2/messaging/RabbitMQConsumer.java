package com.example.CraftYourStyle2.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumidor de mensajes de RabbitMQ para el microservicio de Usuarios
 * 
 * Escucha mensajes de la cola `usuarios.transaccion.queue`
 * con routing key `transaccion.usuario.actualizar`
 */
@Component
public class RabbitMQConsumer {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQConsumer.class);

    /**
     * Procesa mensajes de actualización de usuario desde Transacciones
     * 
     * @param message El mensaje recibido (deserializado automáticamente desde JSON)
     */
    @RabbitListener(queues = "${rabbitmq.queue.consume}")
    public void consumeMessage(Map<String, Object> message) {
        logger.info("📥 [Transacción] Mensaje recibido: {}", message);

        try {
            // Extraer datos del mensaje
            Object userId = message.get("user_id");
            Object campo = message.get("campo");
            Object valorNuevo = message.get("valor_nuevo");
            String evento = (String) message.get("event");

            logger.info("🔄 Procesando evento: {} para usuario: {}", evento, userId);

            // Aquí puedes agregar lógica de negocio, por ejemplo:
            // - Actualizar datos del usuario en la BD
            // - Sincronizar información entre microservicios
            // - Validar cambios
            
            // Ejemplo:
            // if (userId != null) {
            //     userService.processTransactionUpdate(Long.valueOf(userId.toString()), campo, valorNuevo);
            // }

            logger.info("✅ [Transacción] Mensaje procesado correctamente");

        } catch (Exception e) {
            logger.error("❌ [Transacción] Error procesando mensaje: {}", e.getMessage(), e);
            // El mensaje será reencolado automáticamente si hay error
            throw e;
        }
    }
}
