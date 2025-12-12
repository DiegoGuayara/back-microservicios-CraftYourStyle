/**
 * Repository de Productos
 * 
 * Maneja todas las operaciones de base de datos relacionadas con productos.
 * Incluye operaciones CRUD básicas y consultas con JOIN para obtener información detallada.
 */

import type {ProductosDto} from '../DTO/productosDto.js';
import pool from '../config/db-config.js'

export class ProductosRepository{
    /**
     * Crea un nuevo producto en la base de datos
     * 
     * @param producto - Objeto ProductosDto que contiene:
     *   - nombre: Nombre del producto
     *   - descripcion: Descripción detallada del producto
     *   - imagen: URL de la imagen del producto
     *   - category_id: ID de la categoría a la que pertenece
     *   - tienda_id: ID de la tienda dueña del producto
     * 
     * @returns Objeto con el resultado de la inserción (incluye insertId)
     * 
     * Nota: Los campos created_at y updated_at se generan automáticamente en la BD
     */
    static async crearProducto(producto: ProductosDto){
        const {nombre, descripcion, imagen, category_id, tienda_id} = producto;
        const [result] = await pool.query(
            "INSERT INTO productos (name, description, imagen, category_id, tienda_id) VALUES (?, ?, ?, ?, ?)",
            [nombre, descripcion, imagen, category_id, tienda_id]
        );
        return result;
    }

    /**
     * Obtiene todos los productos de la base de datos
     * 
     * @returns Array con todos los productos (solo datos básicos de la tabla productos)
     * 
     * Nota: Este método NO incluye información de categorías, tiendas ni variantes.
     * Para obtener información completa, usar obtenerProductosConDetalles() o obtenerProductosPorTienda()
     */
    static async obtenerProductos(){
        const [rows]:any = await pool.query(
            "SELECT * FROM productos"
        )
        return rows
    }

    /**
     * Obtiene un producto específico por su ID
     * 
     * @param id - ID del producto a buscar
     * @returns Objeto con los datos del producto si existe, null si no se encuentra
     * 
     * Nota: Retorna solo los datos básicos del producto (tabla productos)
     */
    static async obtenerProductoPorId(id:number){
        const [rows]:any = await pool.query(
            "SELECT * FROM productos WHERE id = ?",
            [id]    
        )    
        return rows.length > 0 ? rows[0] : null
    }

    /**
     * Actualiza un producto existente por su ID
     * 
     * @param id - ID del producto a actualizar
     * @param producto - Objeto con los campos a actualizar (puede ser parcial)
     *   Ejemplo: {nombre: "Nuevo nombre"} o {nombre: "...", precio: 1000}
     * 
     * @returns Resultado de la actualización con información de filas afectadas
     * 
     * Nota: Este método es dinámico, solo actualiza los campos que se envíen.
     * No es necesario enviar todos los campos, solo los que se quieren modificar.
     */
    static async actualizarProductoPorId(id:number, producto: Partial<ProductosDto>){
        const fields = [];
        const values = [];
        // Construye dinámicamente la consulta SQL según los campos recibidos
        for (const [key, value] of Object.entries(producto)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }        
        const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);
        const [result] = await pool.query(sql, values);
        return result;
    }

    /**
     * Elimina un producto de la base de datos por su ID
     * 
     * @param id - ID del producto a eliminar
     * @returns Objeto con el resultado si se eliminó, null si no se encontró el producto
     * 
     * Nota: Si hay variantes asociadas al producto, también se eliminarán automáticamente
     * si la BD tiene configurado ON DELETE CASCADE en las foreign keys.
     */
    static async eliminarProductoPorId(id:number){
        const [result]:any = await pool.query(
            "DELETE FROM PRODUCTOS WHERE id = ?",
            [id]
        )
        return result.affectedRows > 0 ? result : null
    }

    /**
     * Obtiene productos con información completa filtrados por tienda Y categoría
     * 
     * @param tienda_id - ID de la tienda de la que se quieren obtener productos
     * @param category_id - ID de la categoría específica dentro de esa tienda
     * 
     * @returns Array de productos con:
     *   - Información básica del producto (id, nombre, descripción, imagen)
     *   - Nombre de la categoría y de la tienda
     *   - Todas las variantes del producto (talla, color, stock, precio)
     * 
     * Nota: Si un producto tiene múltiples variantes, aparecerá una fila por cada variante.
     * Usa LEFT JOIN para variantes, así muestra productos aunque no tengan variantes registradas.
     * 
     * Ejemplo de uso: Mostrar todos los accesorios de la tienda "Artesanías Luna"
     * GET /obtenerProductosConDetalles/1/2
     */
    static async obtenerProductosConDetalles(tienda_id: number, category_id: number){
        const [rows]: any = await pool.query(
            `SELECT
                p.id,
                p.name AS producto,
                p.description AS descripcion,
                p.imagen,
                p.category_id,
                p.tienda_id,
                c.name AS categoria,
                t.nombre AS tienda,
                vp.id AS variante_id,
                vp.size AS talla,
                vp.color,
                vp.stock,
                vp.price AS precio,
                p.created_at,
                p.updated_at
            FROM productos p
            JOIN categoria c ON p.category_id = c.id
            JOIN tienda t ON p.tienda_id = t.id
            LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
            WHERE p.tienda_id = ? AND p.category_id = ?`,
            [tienda_id, category_id]
        );
        return rows;
    }

    /**
     * Obtiene TODOS los productos de una tienda específica (sin filtrar por categoría)
     * 
     * @param tienda_id - ID de la tienda de la que se quieren obtener todos los productos
     * 
     * @returns Array de productos con:
     *   - Información básica del producto (id, nombre, descripción, imagen)
     *   - Nombre de la categoría y de la tienda
     *   - Fechas de creación y actualización
     * 
     * Nota: Este método NO incluye las variantes de productos.
     * Retorna todos los productos de todas las categorías de la tienda.
     * 
     * Ejemplo de uso: Mostrar el catálogo completo de la tienda "Artesanías Luna"
     * GET /obtenerProductosPorTienda/1
     */
    static async obtenerProductosPorTienda(tienda_id: number){
        const [rows]: any = await pool.query(
            `SELECT
                p.id,
                p.name AS producto,
                p.description AS descripcion,
                p.imagen,
                p.category_id,
                p.tienda_id,
                c.name AS categoria,
                t.nombre AS tienda,
                p.created_at,
                p.updated_at
            FROM productos p
            JOIN categoria c ON p.category_id = c.id
            JOIN tienda t ON p.tienda_id = t.id
            WHERE p.tienda_id = ?`,
            [tienda_id]
        );
        return rows;
    }
}
