import amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER || "guest"}:${process.env.RABBITMQ_PASSWORD || "guest"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;
const EXCHANGE_NAME = "craftyourstyle.events";

export const ROUTING_KEYS = {
  PAGO_APROBADO: "pago.aprobado",
  PAGO_PENDIENTE: "pago.pendiente",
  PAGO_RECHAZADO: "pago.rechazado",
};

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<Channel> {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    console.log("✅ RabbitMQ conectado - Pagos");
    console.log(`   Exchange: ${EXCHANGE_NAME}`);

    connection.connection.on("close", () => {
      console.log("⚠️ Conexión RabbitMQ cerrada. Reconectando...");
      setTimeout(() => {
        void connectRabbitMQ();
      }, 5000);
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

export async function publishPaymentEvent(
  routingKey: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    if (!channel) {
      console.error("❌ Canal no disponible");
      return false;
    }

    const message = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
      contentType: "application/json",
    });

    console.log(`📤 Mensaje publicado [${routingKey}]`, message);
    return true;
  } catch (error) {
    console.error("❌ Error publicando mensaje:", error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("🔌 Conexión RabbitMQ cerrada");
  } catch (error) {
    console.error("Error cerrando conexión:", error);
  }
}
