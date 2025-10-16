export interface TransaccionDto {
  numero_de_cuenta: string;
  tipo_de_cuenta: "debito" | "credito";
  banco: string;
  id_user: number
}
