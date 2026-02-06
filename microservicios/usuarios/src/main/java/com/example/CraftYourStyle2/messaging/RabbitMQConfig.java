package com.example.CraftYourStyle2.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de RabbitMQ para el microservicio de Usuarios
 * 
 * Rol:
 * - CONSUMIDOR de `usuarios.transaccion.queue` (recibe de Transacciones)
 * - PRODUCTOR de `usuario.evento` (envía a Notificaciones)
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.queue.consume}")
    private String queueName;

    @Value("${rabbitmq.routing.key.consume}")
    private String routingKeyConsume;

    /**
     * Declara el exchange tipo topic
     */
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    /**
     * Declara la cola para consumir mensajes de transacciones
     */
    @Bean
    public Queue queue() {
        return QueueBuilder.durable(queueName).build();
    }

    /**
     * Vincula la cola al exchange con el routing key
     */
    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder
                .bind(queue)
                .to(exchange)
                .with(routingKeyConsume);
    }

    /**
     * Conversor de mensajes a JSON
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * Template para enviar mensajes
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        rabbitTemplate.setExchange(exchangeName);
        return rabbitTemplate;
    }
}
