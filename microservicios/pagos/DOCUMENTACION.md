# Microservicio de Pagos (Mercado Pago)

## Endpoints
- `POST /pagos/checkout/preference`: crea preferencia de pago en Mercado Pago.
- `POST /pagos/webhook`: recibe notificaciones de Mercado Pago.
- `GET /pagos/:externalReference/estado`: consulta estado local del pago.

## Variables
Usa `.env.example` como base.

## Flujo
1. Frontend pide preferencia al backend.
2. Backend crea preferencia y devuelve `initPoint`.
3. Usuario paga en checkout de Mercado Pago.
4. Mercado Pago notifica al webhook.
5. Servicio valida webhook, consulta pago real, actualiza estado y publica evento RabbitMQ.

## Eventos RabbitMQ publicados
- `pago.aprobado`
- `pago.pendiente`
- `pago.rechazado`

## Instalación
```bash
cd microservicios/pagos
npm install
npm run build
npm start
```
