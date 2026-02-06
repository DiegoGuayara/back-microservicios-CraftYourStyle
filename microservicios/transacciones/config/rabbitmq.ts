/**
 * Configuración de RabbitMQ para el microservicio de Transacciones
 * 
 * Rol: 
 * - CONSUMIDOR de `transacciones.personalizacion.queue` (recibe de Personalización)
 * - PRODUCTOR de `transaccion.completada` (envía a Notificaciones)
 * - PRODUCTOR de `transaccion.usuario.actualizar` (envía a Usuarios)
 */

import amqp from "amqplib";
import type { ChannelModel, Channel } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

// Configuración de conexión
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER || "guest"}:${process.env.RABBITMQ_PASSWORD || "guest"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Exchange principal (tipo topic para routing flexible)
const EXCHANGE_NAME = "craftyourstyle.events";

// Cola que consume este microservicio
const QUEUE_NAME = "transacciones.personalizacion.queue";
const ROUTING_KEY_CONSUME = "personalizacion.confirmada";

// Routing keys para publicar
export const ROUTING_KEYS = {
  TRANSACCION_COMPLETADA: "transaccion.completada",
  TRANSACCION_USUARIO_ACTUALIZAR: "transaccion.usuario.actualizar",
};

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

/**
 * Establece conexión con RabbitMQ y configura exchange/colas
 */
export async function connectRabbitMQ(): Promise<Channel> {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declarar exchange tipo topic
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    // Declarar cola para consumir mensajes de personalización
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY_CONSUME);

    console.log("✅ RabbitMQ conectado - Transacciones");
    console.log(`   Exchange: ${EXCHANGE_NAME}`);
    console.log(`   Cola: ${QUEUE_NAME}`);
    console.log(`   Escuchando: ${ROUTING_KEY_CONSUME}`);

    // Manejar cierre de conexión
    connection.connection.on("close", () => {
      console.log("⚠️ Conexión RabbitMQ cerrada. Reconectando...");
      setTimeout(connectRabbitMQ, 5000);
    });

    connection.connection.on("error", (err: Error) => {
      console.error("❌ Error en conexión RabbitMQ:", err.message);
    });

    return channel;
  } catch (error) {
    console.error("❌ Error conectando a RabbitMQ:", error);
    console.log("🔄 Reintentando en 5 segundos...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectRabbitMQ();
  }
}

/**
 * Publica un mensaje en el exchange
 */
export async function publishMessage(routingKey: string, message: object): Promise<boolean> {
  try {
    if (!channel) {
      console.error("❌ Canal no disponible");
      return false;
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
      contentType: "application/json",
    });

    console.log(`📤 Mensaje publicado [${routingKey}]:`, message);
    return true;
  } catch (error) {
    console.error("❌ Error publicando mensaje:", error);
    return false;
  }
}

/**
 * Inicia el consumidor de mensajes de personalización
 */
export async function startConsumer(
  onMessage: (message: object) => Promise<void>
): Promise<void> {
  try {
    if (!channel) {
      throw new Error("Canal no disponible");
    }

    // Prefetch de 1 para procesamiento ordenado
    await channel.prefetch(1);

    console.log(`👂 Esperando mensajes en ${QUEUE_NAME}...`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Mensaje recibido [${msg.fields.routingKey}]:`, content);

          await onMessage(content);

          // Confirmar procesamiento exitoso
          channel!.ack(msg);
          console.log("✅ Mensaje procesado correctamente");
        } catch (error) {
          console.error("❌ Error procesando mensaje:", error);
          // Rechazar mensaje y reencolarlo
          channel!.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error("❌ Error iniciando consumidor:", error);
    throw error;
  }
}

/**
 * Cierra la conexión con RabbitMQ
 */
export async function closeConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("🔌 Conexión RabbitMQ cerrada");
  } catch (error) {
    console.error("Error cerrando conexión:", error);
  }
}
