import type {ProductosDto} from '../DTO/productosDto.js';
import pool from '../config/db-config.js'

export class ProductosRepository{
    static async crearProducto(producto: ProductosDto){
        const {nombre, descripcion, imagen, category_id, tienda_id} = producto;
        const [result] = await pool.query(
            "INSERT INTO productos (name, description, imagen, category_id, tienda_id) VALUES (?, ?, ?, ?, ?)",
            [nombre, descripcion, imagen, category_id, tienda_id]
        );
        return result;
    }

    static async obtenerProductos(){
        const [rows]:any = await pool.query(
            "SELECT * FROM productos"
        )
        return rows
    }

    static async obtenerProductoPorId(id:number){
        const [rows]:any = await pool.query(
            "SELECT * FROM productos WHERE id = ?",
            [id]    
        )    
        return rows.length > 0 ? rows[0] : null
    }

    static async actualizarProductoPorId(id:number, producto: Partial<ProductosDto>){
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(producto)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }        
        const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        const [result] = await pool.query(sql, values);
        return result;
    }

    static async eliminarProductoPorId(id:number){
        const [result]:any = await pool.query(
            "DELETE FROM PRODUCTOS WHERE id = ?",
            [id]
        )
        return result.affectedRows > 0 ? result : null
    }

    static async obtenerProductosConDetalles(){
    const [rows]: any = await pool.query(
        ` SELECT
            p.id,
            p.name AS producto,
            p.description AS descripcion,
            p.imagen,
            c.name AS categoria,
            t.nombre AS tienda
        FROM productos p,
        JOIN categoria c ON p.category_id = c.id,
        JOIN tienda t ON p.tienda_id = t.id,`
    );
    return rows;
}

}