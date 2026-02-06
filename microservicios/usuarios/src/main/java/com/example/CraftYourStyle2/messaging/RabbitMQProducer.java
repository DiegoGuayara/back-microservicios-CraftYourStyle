package com.example.CraftYourStyle2.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Productor de mensajes de RabbitMQ para el microservicio de Usuarios
 * 
 * Publica eventos con routing key `usuario.evento` que serán
 * consumidos por el microservicio de Notificaciones
 */
@Service
public class RabbitMQProducer {

    private static final Logger logger = LoggerFactory.getLogger(RabbitMQProducer.class);

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.routing.key.publish}")
    private String routingKey;

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Publica un evento de usuario registrado
     */
    public void publishUserRegistered(Long userId, String email, String nombre) {
        Map<String, Object> message = new HashMap<>();
        message.put("event", "usuario_registrado");
        message.put("user_id", userId);
        message.put("email", email);
        message.put("nombre", nombre);
        message.put("timestamp", Instant.now().toString());

        sendMessage(message);
        logger.info("📤 Evento usuario_registrado publicado para user_id: {}", userId);
    }

    /**
     * Publica un evento de usuario actualizado
     */
    public void publishUserUpdated(Long userId, String campoActualizado) {
        Map<String, Object> message = new HashMap<>();
        message.put("event", "usuario_actualizado");
        message.put("user_id", userId);
        message.put("campo_actualizado", campoActualizado);
        message.put("timestamp", Instant.now().toString());

        sendMessage(message);
        logger.info("📤 Evento usuario_actualizado publicado para user_id: {}", userId);
    }

    /**
     * Publica un evento de usuario eliminado
     */
    public void publishUserDeleted(Long userId) {
        Map<String, Object> message = new HashMap<>();
        message.put("event", "usuario_eliminado");
        message.put("user_id", userId);
        message.put("timestamp", Instant.now().toString());

        sendMessage(message);
        logger.info("📤 Evento usuario_eliminado publicado para user_id: {}", userId);
    }

    /**
     * Publica un evento de login de usuario
     */
    public void publishUserLogin(Long userId, String email) {
        Map<String, Object> message = new HashMap<>();
        message.put("event", "usuario_login");
        message.put("user_id", userId);
        message.put("email", email);
        message.put("timestamp", Instant.now().toString());

        sendMessage(message);
        logger.info("📤 Evento usuario_login publicado para user_id: {}", userId);
    }

    /**
     * Método genérico para publicar eventos personalizados
     */
    public void publishCustomEvent(String eventName, Map<String, Object> data) {
        Map<String, Object> message = new HashMap<>(data);
        message.put("event", eventName);
        message.put("timestamp", Instant.now().toString());

        sendMessage(message);
        logger.info("📤 Evento {} publicado", eventName);
    }

    /**
     * Envía el mensaje al exchange de RabbitMQ
     */
    private void sendMessage(Map<String, Object> message) {
        try {
            rabbitTemplate.convertAndSend(routingKey, message);
            logger.debug("Mensaje enviado con routing key: {}", routingKey);
        } catch (Exception e) {
            logger.error("❌ Error enviando mensaje a RabbitMQ: {}", e.getMessage(), e);
            throw e;
        }
    }
}
