import type {ProductosDto} from '../DTO/productosDto.js';
import pool from '../config/db-config.js'

export class ProductosRepository{
    static async crearProducto(producto: ProductosDto){
        const {id, nombre, descripcion, categoria, imagen,created_at, updated_at} = producto;
        const [result] = await pool.query(
            "INSERT INTO productos (id, nombre, descripcion, categoria, imagen,created_at, updated_at) VALUES (?, ?, ?, ?,?,?,?)",
            [id,nombre, descripcion, categoria, imagen,created_at, updated_at]
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
}