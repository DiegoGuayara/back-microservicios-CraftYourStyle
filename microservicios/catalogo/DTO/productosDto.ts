import { IsOptional } from "class-validator";
export class ProductosDto {
  id?: number;
  nombre: string = "";
  descripcion: string = "";
  imagen: string = "";
  category_id: number = 0;
  tienda_id: number = 0;

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}
