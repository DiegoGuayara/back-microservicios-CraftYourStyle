"""
Configuración de RabbitMQ para el microservicio de Notificaciones

Rol:
- CONSUMIDOR de `notificaciones.transaccion.queue` (recibe de Transacciones)
- CONSUMIDOR de `notificaciones.usuario.queue` (recibe de Usuarios)
"""

import os
import json
import threading
import time
import pika
from pika.exceptions import AMQPConnectionError

# Configuración de conexión
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

# Exchange principal
EXCHANGE_NAME = "craftyourstyle.events"

# Colas que consume este microservicio
QUEUES = {
    "transaccion": {
        "queue": "notificaciones.transaccion.queue",
        "routing_key": "transaccion.completada"
    },
    "usuario": {
        "queue": "notificaciones.usuario.queue",
        "routing_key": "usuario.evento"
    }
}


def get_connection():
    """Crea y retorna una conexión a RabbitMQ"""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300
    )
    return pika.BlockingConnection(parameters)


def process_transaccion_message(ch, method, properties, body):
    """
    Procesa mensajes de transacciones completadas
    """
    try:
        message = json.loads(body)
        print(f"📥 [Transacción] Mensaje recibido: {message}")
        
        # Aquí puedes agregar lógica para:
        # - Enviar email de confirmación
        # - Crear notificación push
        # - Guardar en BD
        
        # Ejemplo: crear notificación en la BD
        # from app.core.config import SessionLocal
        # from app.services.notificacion import crear_notificacion
        # db = SessionLocal()
        # crear_notificacion(db, {...})
        # db.close()
        
        print(f"✅ [Transacción] Mensaje procesado correctamente")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"❌ [Transacción] Error procesando mensaje: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def process_usuario_message(ch, method, properties, body):
    """
    Procesa mensajes de eventos de usuario
    """
    try:
        message = json.loads(body)
        print(f"📥 [Usuario] Mensaje recibido: {message}")
        
        # Aquí puedes agregar lógica para:
        # - Enviar email de bienvenida
        # - Notificar cambios en la cuenta
        # - Enviar recordatorios
        
        print(f"✅ [Usuario] Mensaje procesado correctamente")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"❌ [Usuario] Error procesando mensaje: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_consumer(queue_name: str, routing_key: str, callback):
    """
    Inicia un consumidor para una cola específica
    """
    while True:
        try:
            connection = get_connection()
            channel = connection.channel()
            
            # Declarar exchange
            channel.exchange_declare(
                exchange=EXCHANGE_NAME,
                exchange_type="topic",
                durable=True
            )
            
            # Declarar cola
            channel.queue_declare(queue=queue_name, durable=True)
            
            # Vincular cola al exchange
            channel.queue_bind(
                exchange=EXCHANGE_NAME,
                queue=queue_name,
                routing_key=routing_key
            )
            
            # Configurar prefetch
            channel.basic_qos(prefetch_count=1)
            
            print(f"👂 Escuchando en {queue_name} (routing: {routing_key})...")
            
            # Iniciar consumo
            channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback,
                auto_ack=False
            )
            
            channel.start_consuming()
            
        except AMQPConnectionError as e:
            print(f"⚠️ Conexión perdida ({queue_name}): {e}")
            print("🔄 Reconectando en 5 segundos...")
            time.sleep(5)
        except Exception as e:
            print(f"❌ Error en consumidor ({queue_name}): {e}")
            time.sleep(5)


def start_consumers_in_background():
    """
    Inicia todos los consumidores en threads separados
    """
    print("🐰 Iniciando consumidores de RabbitMQ...")
    
    # Thread para cola de transacciones
    transaccion_thread = threading.Thread(
        target=start_consumer,
        args=(
            QUEUES["transaccion"]["queue"],
            QUEUES["transaccion"]["routing_key"],
            process_transaccion_message
        ),
        daemon=True
    )
    transaccion_thread.start()
    
    # Thread para cola de usuarios
    usuario_thread = threading.Thread(
        target=start_consumer,
        args=(
            QUEUES["usuario"]["queue"],
            QUEUES["usuario"]["routing_key"],
            process_usuario_message
        ),
        daemon=True
    )
    usuario_thread.start()
    
    print("✅ Consumidores iniciados en background")
    print(f"   - {QUEUES['transaccion']['queue']}")
    print(f"   - {QUEUES['usuario']['queue']}")
