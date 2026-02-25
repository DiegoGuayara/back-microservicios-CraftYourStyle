export interface CreatePreferenceDto {
  orderId: string;
  userId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  currency: "COP" | "ARS" | "BRL" | "MXN" | "PEN" | "CLP" | "UYU";
  email?: string;
  idempotencyKey?: string;
}

export interface PaymentWebhookPayload {
  id?: string;
  type?: string;
  topic?: string;
  data?: {
    id?: string;
  };
}
