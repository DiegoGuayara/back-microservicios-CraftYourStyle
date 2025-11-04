import { IsOptional } from 'class-validator';
export class ProductosDto {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  categoria: string = '';
  imagen: string = '';

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}

