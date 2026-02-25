import type { Request, Response } from "express";
import crypto from "node:crypto";
import type { CreatePreferenceDto, PaymentWebhookPayload } from "../DTO/createPreferenceDto.js";
import { mpPayment, mpPreference } from "../config/mercadopago.js";
import { publishPaymentEvent, ROUTING_KEYS } from "../config/rabbitmq.js";
import { PagosRepository } from "../repository/pagosRepository.js";

function mapStatusToRoutingKey(status: string): string {
  if (status === "approved") return ROUTING_KEYS.PAGO_APROBADO;
  if (status === "pending" || status === "in_process") return ROUTING_KEYS.PAGO_PENDIENTE;
  return ROUTING_KEYS.PAGO_RECHAZADO;
}

function buildExternalReference(orderId: string): string {
  return orderId.trim();
}

function isSignatureValid(req: Request): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const signature = req.header("x-signature") || "";
  const requestId = req.header("x-request-id") || "";

  const params = new URLSearchParams(signature.replace(/,/g, "&"));
  const ts = params.get("ts");
  const v1 = params.get("v1");

  const dataId = (req.query["data.id"] as string | undefined) || (req.body?.data?.id as string | undefined) || "";
  if (!ts || !v1 || !requestId || !dataId) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return hmac === v1;
}

export class PagosController {
  static async createPreference(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as Partial<CreatePreferenceDto>;
      const idempotencyKey = body.idempotencyKey || req.header("x-idempotency-key") || `${body.orderId}-${body.userId}`;

      if (!body.orderId || !body.userId || !body.title || !body.quantity || !body.unitPrice || !body.currency) {
        res.status(400).json({ message: "Faltan campos requeridos" });
        return;
      }

      if (body.quantity <= 0 || body.unitPrice <= 0) {
        res.status(400).json({ message: "quantity y unitPrice deben ser mayores a cero" });
        return;
      }

      const existingByKey = await PagosRepository.findByIdempotencyKey(idempotencyKey);
      if (existingByKey?.init_point) {
        res.status(200).json({
          message: "Preferencia ya creada",
          externalReference: existingByKey.external_reference,
          preferenceId: existingByKey.mp_preference_id,
          initPoint: existingByKey.init_point,
          sandboxInitPoint: existingByKey.sandbox_init_point,
          status: existingByKey.status,
        });
        return;
      }

      const externalReference = buildExternalReference(body.orderId);
      const existingOrder = await PagosRepository.findByExternalReference(externalReference);
      if (existingOrder?.init_point) {
        res.status(200).json({
          message: "La orden ya tiene preferencia",
          externalReference: existingOrder.external_reference,
          preferenceId: existingOrder.mp_preference_id,
          initPoint: existingOrder.init_point,
          sandboxInitPoint: existingOrder.sandbox_init_point,
          status: existingOrder.status,
        });
        return;
      }

      const preferenceBody = {
        items: [
          {
            id: externalReference,
            title: body.title,
            quantity: body.quantity,
            unit_price: body.unitPrice,
            currency_id: body.currency,
          },
        ],
        external_reference: externalReference,
        notification_url: `${process.env.PAGOS_PUBLIC_BASE_URL || "http://localhost:10103"}/pagos/webhook`,
        back_urls: {
          success: process.env.CHECKOUT_SUCCESS_URL || "http://localhost:3000/pago/success",
          pending: process.env.CHECKOUT_PENDING_URL || "http://localhost:3000/pago/pending",
          failure: process.env.CHECKOUT_FAILURE_URL || "http://localhost:3000/pago/failure",
        },
        auto_return: "approved" as const,
      };

      const preferenceRequest = body.email
        ? { ...preferenceBody, payer: { email: body.email } }
        : preferenceBody;

      const preferenceResult = await mpPreference.create({
        body: preferenceRequest,
      });

      const paymentIntentInput: {
        order_id: string;
        user_id: number;
        external_reference: string;
        amount: number;
        currency: CreatePreferenceDto["currency"];
        status: string;
        idempotency_key: string;
        mp_preference_id?: string;
        init_point?: string;
        sandbox_init_point?: string;
      } = {
        order_id: body.orderId,
        user_id: body.userId,
        external_reference: externalReference,
        amount: body.unitPrice * body.quantity,
        currency: body.currency,
        status: "preference_created",
        idempotency_key: idempotencyKey,
      };

      if (preferenceResult.id) paymentIntentInput.mp_preference_id = preferenceResult.id;
      if (preferenceResult.init_point) paymentIntentInput.init_point = preferenceResult.init_point;
      if (preferenceResult.sandbox_init_point) paymentIntentInput.sandbox_init_point = preferenceResult.sandbox_init_point;

      await PagosRepository.upsertPaymentIntent(paymentIntentInput);

      res.status(201).json({
        externalReference,
        preferenceId: preferenceResult.id,
        initPoint: preferenceResult.init_point,
        sandboxInitPoint: preferenceResult.sandbox_init_point,
      });
    } catch (error) {
      console.error("Error creando preferencia:", error);
      res.status(500).json({ message: "Error creando preferencia de pago" });
    }
  }

  static async webhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as PaymentWebhookPayload;
      const topic = payload.type || payload.topic || (req.query.topic as string | undefined) || "unknown";
      const dataId = payload.data?.id || payload.id || (req.query["data.id"] as string | undefined) || null;

      const signatureValid = isSignatureValid(req);
      await PagosRepository.saveWebhookReceipt({
        mp_topic: topic,
        mp_resource_id: dataId,
        signature_valid: signatureValid,
        raw_body: JSON.stringify(payload),
      });

      if (!signatureValid) {
        res.status(401).json({ message: "Firma webhook inválida" });
        return;
      }

      if (!dataId || topic !== "payment") {
        res.status(200).json({ message: "Webhook recibido (sin acción)" });
        return;
      }

      const payment = await mpPayment.get({ id: dataId });
      const externalReference = payment.external_reference;
      const status = payment.status || "unknown";

      if (!externalReference) {
        res.status(200).json({ message: "Pago sin external_reference" });
        return;
      }

      await PagosRepository.updatePaymentFromWebhook({
        external_reference: externalReference,
        mp_payment_id: String(payment.id),
        status,
      });

      await PagosRepository.savePaymentEvent({
        external_reference: externalReference,
        event_type: `mp.${status}`,
        payload_json: JSON.stringify(payment),
      });

      await publishPaymentEvent(mapStatusToRoutingKey(status), {
        provider: "mercadopago",
        externalReference,
        paymentId: payment.id,
        status,
        transactionAmount: payment.transaction_amount,
        userId: null,
      });

      res.status(200).json({ message: "Webhook procesado" });
    } catch (error) {
      console.error("Error procesando webhook:", error);
      res.status(500).json({ message: "Error procesando webhook" });
    }
  }

  static async getStatusByExternalReference(req: Request, res: Response): Promise<void> {
    try {
      const externalReferenceParam = req.params.externalReference;
      const externalReference =
        typeof externalReferenceParam === "string"
          ? externalReferenceParam
          : Array.isArray(externalReferenceParam)
            ? externalReferenceParam[0]
            : undefined;

      if (!externalReference) {
        res.status(400).json({ message: "externalReference es requerido" });
        return;
      }

      const result = await PagosRepository.findByExternalReference(externalReference);

      if (!result) {
        res.status(404).json({ message: "Pago no encontrado" });
        return;
      }

      res.status(200).json({
        externalReference: result.external_reference,
        orderId: result.order_id,
        userId: result.user_id,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        mpPreferenceId: result.mp_preference_id,
        mpPaymentId: result.mp_payment_id,
        updatedAt: result.updated_at,
      });
    } catch (error) {
      console.error("Error consultando estado de pago:", error);
      res.status(500).json({ message: "Error consultando estado" });
    }
  }
}
