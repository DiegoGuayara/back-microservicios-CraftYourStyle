import pool from "../config/db-config.js";

interface PaymentIntentUpsert {
  order_id: string;
  user_id: number;
  external_reference: string;
  amount: number;
  currency: string;
  status: string;
  mp_preference_id?: string;
  mp_payment_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  idempotency_key: string;
}

interface WebhookReceiptInput {
  mp_topic: string;
  mp_resource_id: string | null;
  signature_valid: boolean;
  raw_body: string;
}

interface PaymentEventInput {
  external_reference: string;
  event_type: string;
  payload_json: string;
}

interface WebhookUpdateInput {
  external_reference: string;
  mp_payment_id: string;
  status: string;
}

export class PagosRepository {
  static async findByIdempotencyKey(idempotencyKey: string) {
    const [rows]: any = await pool.query(
      "SELECT * FROM payment_intents WHERE idempotency_key = ? LIMIT 1",
      [idempotencyKey]
    );
    return rows[0];
  }

  static async findByExternalReference(externalReference: string) {
    const [rows]: any = await pool.query(
      "SELECT * FROM payment_intents WHERE external_reference = ? LIMIT 1",
      [externalReference]
    );
    return rows[0];
  }

  static async upsertPaymentIntent(data: PaymentIntentUpsert) {
    const [result]: any = await pool.query(
      `INSERT INTO payment_intents (
         order_id, user_id, external_reference, amount, currency, status,
         mp_preference_id, mp_payment_id, init_point, sandbox_init_point, idempotency_key
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         amount = VALUES(amount),
         currency = VALUES(currency),
         status = VALUES(status),
         mp_preference_id = VALUES(mp_preference_id),
         mp_payment_id = COALESCE(VALUES(mp_payment_id), mp_payment_id),
         init_point = VALUES(init_point),
         sandbox_init_point = VALUES(sandbox_init_point),
         updated_at = CURRENT_TIMESTAMP`,
      [
        data.order_id,
        data.user_id,
        data.external_reference,
        data.amount,
        data.currency,
        data.status,
        data.mp_preference_id || null,
        data.mp_payment_id || null,
        data.init_point || null,
        data.sandbox_init_point || null,
        data.idempotency_key,
      ]
    );
    return result;
  }

  static async updatePaymentFromWebhook(data: WebhookUpdateInput) {
    const [result]: any = await pool.query(
      `UPDATE payment_intents
       SET status = ?, mp_payment_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE external_reference = ?`,
      [data.status, data.mp_payment_id, data.external_reference]
    );
    return result;
  }

  static async saveWebhookReceipt(data: WebhookReceiptInput) {
    const [result]: any = await pool.query(
      `INSERT INTO webhook_receipts (mp_topic, mp_resource_id, signature_valid, raw_body)
       VALUES (?, ?, ?, ?)`,
      [data.mp_topic, data.mp_resource_id, data.signature_valid ? 1 : 0, data.raw_body]
    );
    return result;
  }

  static async savePaymentEvent(data: PaymentEventInput) {
    const [result]: any = await pool.query(
      `INSERT INTO payment_events (external_reference, event_type, payload_json)
       VALUES (?, ?, ?)`,
      [data.external_reference, data.event_type, data.payload_json]
    );
    return result;
  }
}
