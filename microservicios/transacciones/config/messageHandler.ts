/**
 * Handler de mensajes de RabbitMQ para Transacciones
 * 
 * Procesa mensajes recibidos de otros microservicios
 * y ejecuta la lógica de negocio correspondiente.
 */

import { publishMessage, ROUTING_KEYS } from "./rabbitmq.js";

// Interfaz para mensajes de personalización confirmada
interface PersonalizacionConfirmadaMessage {
  personalizacion_id: number;
  variant_id: number;
  user_id: number;
  color?: string;
  imagen?: string;
  texto?: string;
  tipo_letra?: string;
  timestamp: string;
}

/**
 * Procesa mensajes recibidos de la cola transacciones.personalizacion.queue
 */
export async function handlePersonalizacionConfirmada(
  message: PersonalizacionConfirmadaMessage
): Promise<void> {
  console.log("🔄 Procesando personalización confirmada:", message);

  try {
    // Aquí puedes agregar lógica de negocio, por ejemplo:
    // - Crear registro de transacción pendiente
    // - Validar datos del usuario
    // - Calcular costos adicionales

    // Ejemplo: Notificar que la transacción está lista para procesar
    // Esto enviará un mensaje a Notificaciones
    await publishMessage(ROUTING_KEYS.TRANSACCION_COMPLETADA, {
      type: "personalizacion_recibida",
      personalizacion_id: message.personalizacion_id,
      user_id: message.user_id,
      status: "procesando",
      message: "Tu personalización ha sido recibida y está siendo procesada",
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Personalización procesada correctamente");
  } catch (error) {
    console.error("❌ Error procesando personalización:", error);
    throw error;
  }
}

/**
 * Función principal que recibe cualquier mensaje y lo enruta al handler correcto
 */
export async function processMessage(message: any): Promise<void> {
  // Por ahora solo manejamos mensajes de personalización
  // Puedes extender esto con más tipos de mensajes
  await handlePersonalizacionConfirmada(message);
}

/**
 * Funciones auxiliares para publicar eventos desde el controller
 */
export async function notificarTransaccionCompletada(data: {
  transaccion_id: number;
  user_id: number;
  monto: number;
  tipo: string;
}): Promise<boolean> {
  return publishMessage(ROUTING_KEYS.TRANSACCION_COMPLETADA, {
    ...data,
    event: "transaccion_completada",
    timestamp: new Date().toISOString(),
  });
}

export async function notificarActualizacionUsuario(data: {
  user_id: number;
  campo: string;
  valor_anterior?: any;
  valor_nuevo: any;
}): Promise<boolean> {
  return publishMessage(ROUTING_KEYS.TRANSACCION_USUARIO_ACTUALIZAR, {
    ...data,
    event: "actualizacion_desde_transacciones",
    timestamp: new Date().toISOString(),
  });
}
