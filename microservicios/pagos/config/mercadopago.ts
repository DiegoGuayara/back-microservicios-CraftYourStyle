import dotenv from "dotenv";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

dotenv.config();

const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN no está configurado");
}

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
