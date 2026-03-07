import { IsOptional } from "class-validator";
export class ProductosDto {
  id?: number;
  nombre: string = "";
  imagen_url?: string;
  descripcion?: string;
  categoria_id: number = 0;
  price: number = 0;
  talla: string = "";
  genero: string = "Unisex";

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}
