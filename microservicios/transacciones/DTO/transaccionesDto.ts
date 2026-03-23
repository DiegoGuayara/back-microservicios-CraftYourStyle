/**
 * DTO (Data Transfer Object) de Transacciones
 * 
 * Define la estructura de datos para cuentas bancarias.
 * Los usuarios registran sus métodos de pago para realizar compras.
 * 
 * @property numero_de_cuenta - Número de la cuenta bancaria (máx. 100 caracteres)
 * @property tipo_de_cuenta - Tipo de cuenta: "debito" o "credito"
 * @property banco - Nombre del banco emisor (máx. 50 caracteres)
 * @property id_user - ID del usuario dueño de la cuenta
 */
export interface TransaccionDto {
  numero_de_cuenta: string;
  tipo_de_cuenta: "debito" | "credito";
  banco: string;
  id_user: number
}

export interface BancoDto {
  id?: number;
  nombre: string;
}

export type EstadoPago =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "CANCELADA"
  | "EXPIRADA"
  | "ERROR";

export interface PagoCheckoutDto {
  orderId: string;
  userId: number;
  amount: number;
  currency?: string;
  description: string;
  tax?: number;
  taxBase?: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    docType?: string;
    docNumber?: string;
  };
}

export interface PagoEpaycoRecord {
  id?: number;
  order_id: string;
  user_id: number;
  provider: "epayco" | "mock";
  provider_reference: string;
  epayco_ref?: string | null;
  transaction_id?: string | null;
  amount: number;
  currency: string;
  description: string;
  status: EstadoPago;
  raw_response?: string | null;
}

export interface EpaycoWebhookPayload {
  ref_payco?: string;
  x_ref_payco?: string;
  x_transaction_id?: string;
  x_amount?: string;
  x_currency_code?: string;
  x_signature?: string;
  x_response?: string;
  x_response_reason_text?: string;
  x_transaction_state?: string;
  x_franchise?: string;
  x_extra1?: string;
  x_extra2?: string;
  x_extra3?: string;
  [key: string]: unknown;
}
