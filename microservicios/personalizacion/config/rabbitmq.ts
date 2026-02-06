/**
 * Configuración de RabbitMQ para el microservicio de Personalización
 * 
 * Rol: PRODUCTOR de `personalizacion.confirmada` (envía a Transacciones)
 */

import amqp from "amqplib";
import type { ChannelModel, Channel } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

// Configuración de conexión
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER || "guest"}:${process.env.RABBITMQ_PASSWORD || "guest"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

// Exchange principal
const EXCHANGE_NAME = "craftyourstyle.events";

// Routing key para publicar
export const ROUTING_KEY = "personalizacion.confirmada";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

/**
 * Establece conexión con RabbitMQ
 */
export async function connectRabbitMQ(): Promise<Channel> {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Declarar exchange tipo topic
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    console.log("✅ RabbitMQ conectado - Personalización");
    console.log(`   Exchange: ${EXCHANGE_NAME}`);
    console.log(`   Publica en: ${ROUTING_KEY}`);

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
 * Publica evento de personalización confirmada
 */
export async function publishPersonalizacionConfirmada(data: {
  personalizacion_id: number;
  variant_id?: number;
  user_id?: number;
  color?: string;
  image_url?: string;
  textos?: string;
  tipo_letra?: string;
}): Promise<boolean> {
  try {
    if (!channel) {
      console.error("❌ Canal no disponible");
      return false;
    }

    const message = {
      ...data,
      event: "personalizacion.confirmada",
      timestamp: new Date().toISOString(),
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));

    channel.publish(EXCHANGE_NAME, ROUTING_KEY, messageBuffer, {
      persistent: true,
      contentType: "application/json",
    });

    console.log(`📤 Mensaje publicado [${ROUTING_KEY}]:`, message);
    return true;
  } catch (error) {
    console.error("❌ Error publicando mensaje:", error);
    return false;
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
