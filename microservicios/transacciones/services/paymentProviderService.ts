import crypto from "crypto";
import type {
  EpaycoWebhookPayload,
  EstadoPago,
  PagoCheckoutDto,
  PagoEpaycoRecord,
} from "../DTO/transaccionesDto.js";

type CheckoutResult = {
  payment: PagoEpaycoRecord;
  checkoutConfig: Record<string, unknown>;
};

function normalizeAmount(value: number) {
  return Number(value.toFixed(2));
}

function randomSuffix() {
  return crypto.randomBytes(4).toString("hex");
}

function buildInternalReference(orderId: string) {
  return `CYS-${orderId}-${Date.now()}-${randomSuffix()}`;
}

function mapEpaycoStatus(response?: string): EstadoPago {
  const normalized = String(response ?? "").trim().toLowerCase();

  switch (normalized) {
    case "aceptada":
      return "APROBADA";
    case "rechazada":
      return "RECHAZADA";
    case "pendiente":
      return "PENDIENTE";
    case "fallida":
      return "ERROR";
    case "cancelada":
      return "CANCELADA";
    case "expirada":
      return "EXPIRADA";
    default:
      return "PENDIENTE";
  }
}

export class PaymentProviderService {
  static getProvider(): "epayco" | "mock" {
    const provider = String(process.env.PAYMENT_PROVIDER ?? "epayco")
      .trim()
      .toLowerCase();

    return provider === "mock" ? "mock" : "epayco";
  }

  static createCheckout(data: PagoCheckoutDto): CheckoutResult {
    const provider = this.getProvider();
    const currency = String(data.currency ?? "COP").toUpperCase();
    const amount = normalizeAmount(data.amount);
    const tax = normalizeAmount(data.tax ?? 0);
    const taxBase = normalizeAmount(data.taxBase ?? Math.max(amount - tax, 0));
    const internalReference = buildInternalReference(data.orderId);

    const payment: PagoEpaycoRecord = {
      order_id: data.orderId,
      user_id: data.userId,
      provider,
      provider_reference: internalReference,
      amount,
      currency,
      description: data.description,
      status: provider === "mock" ? "APROBADA" : "PENDIENTE",
      raw_response: null,
    };

    if (provider === "mock") {
      return {
        payment,
        checkoutConfig: {
          provider,
          mode: "mock",
          approved: true,
          reference: internalReference,
        },
      };
    }

    const publicKey = process.env.EPAYCO_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error(
        "EPAYCO_PUBLIC_KEY no esta configurada. Configura las credenciales antes de crear el checkout."
      );
    }

    const responseUrl =
      process.env.EPAYCO_RESPONSE_URL ??
      "http://localhost:10101/transacciones/respuesta/epayco";
    const confirmationUrl =
      process.env.EPAYCO_CONFIRMATION_URL ??
      "http://localhost:10101/transacciones/webhook/epayco";
    const test = String(process.env.EPAYCO_TEST ?? "true").toLowerCase() === "true";

    return {
      payment,
      checkoutConfig: {
        provider,
        key: publicKey,
        test,
        external: "false",
        name: data.description,
        description: data.description,
        invoice: internalReference,
        currency,
        amount,
        tax,
        tax_base: taxBase,
        country: "co",
        lang: "es",
        response: responseUrl,
        confirmation: confirmationUrl,
        extra1: data.orderId,
        extra2: String(data.userId),
        extra3: internalReference,
        name_billing: data.customer?.name ?? "Cliente CraftYourStyle",
        email_billing: data.customer?.email ?? "",
        mobilephone_billing: data.customer?.phone ?? "",
        doc_type: data.customer?.docType ?? "CC",
        doc_number: data.customer?.docNumber ?? "",
      },
    };
  }

  static validateWebhookSignature(payload: EpaycoWebhookPayload) {
    const customerId = process.env.EPAYCO_P_CUST_ID_CLIENTE;
    const pKey = process.env.EPAYCO_P_KEY;

    if (!customerId || !pKey) {
      return {
        valid: false,
        skipped: true,
        reason:
          "EPAYCO_P_CUST_ID_CLIENTE o EPAYCO_P_KEY no estan configuradas; no se pudo validar la firma.",
      };
    }

    const ref = String(payload.x_ref_payco ?? "");
    const transactionId = String(payload.x_transaction_id ?? "");
    const amount = String(payload.x_amount ?? "");
    const currency = String(payload.x_currency_code ?? "");
    const incomingSignature = String(payload.x_signature ?? "").toLowerCase();

    const signature = crypto
      .createHash("sha256")
      .update(`${customerId}^${pKey}^${ref}^${transactionId}^${amount}^${currency}`)
      .digest("hex")
      .toLowerCase();

    return {
      valid: signature === incomingSignature,
      skipped: false,
      reason: signature === incomingSignature ? undefined : "Firma ePayco invalida.",
    };
  }

  static mapWebhookStatus(payload: EpaycoWebhookPayload): EstadoPago {
    return mapEpaycoStatus(String(payload.x_response ?? payload.x_transaction_state ?? ""));
  }
}
