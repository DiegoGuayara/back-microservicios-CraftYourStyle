package com.example.CraftYourStyle2.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumidor de mensajes de RabbitMQ para el microservicio de Usuarios
 *
 * Escucha mensajes de la cola `usuarios.transaccion.queue`
 * con routing key `transaccion.usuario.actualizar`
 */
@Component
@ConditionalOnProperty(name = "app.rabbitmq.enabled", havingValue = "true")
public class RabbitMQConsumer {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQConsumer.class);

    @RabbitListener(queues = "${rabbitmq.queue.consume}")
    public void consumeMessage(Map<String, Object> message) {
        logger.info("[Transaccion] Mensaje recibido: {}", message);

        try {
            Object userId = message.get("user_id");
            Object campo = message.get("campo");
            Object valorNuevo = message.get("valor_nuevo");
            String evento = (String) message.get("event");

            logger.info("Procesando evento: {} para usuario: {}", evento, userId);

            logger.info("Mensaje procesado correctamente");

        } catch (Exception e) {
            logger.error("Error procesando mensaje: {}", e.getMessage(), e);
            throw e;
        }
    }
}
