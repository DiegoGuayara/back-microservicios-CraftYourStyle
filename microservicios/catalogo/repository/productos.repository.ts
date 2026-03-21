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
     *   - imagen_url: URL de la imagen del producto
     *   - categoria_id: ID de la categoría a la que pertenece
     *   - precio: Precio del producto
     *   - talla: Talla del producto
     * 
     * @returns Objeto con el resultado de la inserción (incluye insertId)
     * 
     * Nota: Los campos created_at y updated_at se generan automáticamente en la BD
     */
    static async crearProducto(producto: ProductosDto){
        const {nombre, descripcion, imagen_url, categoria_id, price, talla, genero} = producto;
        const [result] = await pool.query(
            "INSERT INTO productos (nombre, image_url, descripcion, category_id, price, talla, genero) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [nombre, imagen_url ?? null, descripcion ?? null, categoria_id, price, talla, genero]
        );
        return result;
    }

    static async crearVerificacionPrenda(producto_id: number, existencias: string) {
        const [result] = await pool.query(
            "INSERT INTO verificacionPrenda (stock, producto_id) VALUES (?, ?)",
            [existencias, producto_id]
        );
        return result;
    }

    /**
     * Obtiene todos los productos de la base de datos
     * 
     * @returns Array con todos los productos (solo datos básicos de la tabla productos)
     * 
     * Nota: Este método NO incluye información de categorías, tiendas ni variantes.
     * Para obtener información completa, usar obtenerProductosConDetalles()
     */
    static async obtenerProductos(genero?: string){
        const hasGenero = typeof genero === "string" && genero.trim().length > 0;
        const [rows]:any = hasGenero
            ? await pool.query(
                `SELECT
                    p.*,
                    COALESCE(SUM(vp.stock), 0) AS stock_total
                FROM productos p
                LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
                WHERE LOWER(p.genero) = LOWER(?)
                GROUP BY p.id`,
                [genero]
            )
            : await pool.query(
                `SELECT
                    p.*,
                    COALESCE(SUM(vp.stock), 0) AS stock_total
                FROM productos p
                LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
                GROUP BY p.id`
            );
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
            `SELECT
                p.*,
                COALESCE(SUM(vp.stock), 0) AS stock_total
            FROM productos p
            LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
            WHERE p.id = ?
            GROUP BY p.id`,
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
        const fieldMap: Record<string, string> = {
            nombre: "nombre",
            descripcion: "descripcion",
            imagen_url: "image_url",
            categoria_id: "category_id",
            price: "price",
            precio: "price",
            talla: "talla",
            genero: "genero",
            gender: "genero",
        };
        // Construye dinámicamente la consulta SQL según los campos recibidos
        for (const [key, value] of Object.entries(producto)) {
            const dbField = fieldMap[key];
            if (!dbField) continue;
            fields.push(`${dbField} = ?`);
            values.push(value);
        }
        if (fields.length === 0) {
            return null;
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
     * Obtiene productos con información completa filtrados por categoría
     * 
     * @param categoria_id - ID de la categoría específica
     * 
     * @returns Array de productos con:
     *   - Información básica del producto (id, nombre, descripción, imagen)
     *   - Nombre de la categoría
     *   - Todas las variantes del producto (talla, color, stock, precio)
     * 
     * Nota: Si un producto tiene múltiples variantes, aparecerá una fila por cada variante.
     * Usa LEFT JOIN para variantes, así muestra productos aunque no tengan variantes registradas.
     * 
     * Ejemplo de uso: Mostrar todos los productos de la categoría 2
     * GET /obtenerProductosConDetalles/2
     */
    static async obtenerProductosConDetalles(categoria_id: number){
        const [rows]: any = await pool.query(
            `SELECT
                p.id,
                p.nombre AS producto,
                p.descripcion AS descripcion,
                p.image_url AS imagen_url,
                p.category_id AS categoria_id,
                p.price AS precio,
                p.talla,
                p.genero,
                c.name AS categoria,
                COALESCE(SUM(vp.stock), 0) AS existencias,
                COUNT(vp.id) AS total_variantes,
                p.created_at,
                p.updated_at
            FROM productos p
            JOIN categoria c ON p.category_id = c.id
            LEFT JOIN variantes_productos vp ON p.id = vp.producto_id
            WHERE p.category_id = ?
            GROUP BY
                p.id,
                p.nombre,
                p.descripcion,
                p.image_url,
                p.category_id,
                p.price,
                p.talla,
                p.genero,
                c.name,
                p.created_at,
                p.updated_at`,
            [categoria_id]
        );
        return rows;
    }
}
