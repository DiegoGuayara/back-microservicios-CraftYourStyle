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
