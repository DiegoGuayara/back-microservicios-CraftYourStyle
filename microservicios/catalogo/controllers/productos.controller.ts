/**
 * Controller de Productos
 * 
 * Maneja las peticiones HTTP relacionadas con productos.
 * Valida los datos recibidos y llama a los métodos del repository correspondiente.
 */

import { Request,Response } from "express";
import { ProductosRepository } from "../repository/productos.repository.js";
import type { ProductosDto } from "../DTO/productosDto.js";

export class ProductoController{
    /**
     * Crea un nuevo producto
     * 
     * Ruta: POST /productos/crearProducto
     * 
     * Body esperado:
     * {
     *   "nombre": "Nombre del producto",
     *   "descripcion": "Descripción del producto",
     *   "imagen": "URL de la imagen",
     *   "category_id": 1,
     *   "tienda_id": 1
     * }
     * 
     * Respuesta exitosa (201): {message: "Producto creado", id: insertId}
     * Errores: 400 (faltan datos), 500 (error del servidor)
     */
    static async createProduct(req:Request,res:Response){
        try{
        const {nombre, descripcion, imagen, category_id, tienda_id} = req.body
        const newProducto:ProductosDto = {
            nombre,
            descripcion, 
            imagen,
            category_id,
            tienda_id
        }
        // Validar que todos los campos obligatorios estén presentes
        if(!nombre || !descripcion || !imagen || !category_id || !tienda_id){
            res.status(400).json({message:"Faltan datos obligatorios"})
            return
        }
            const result = await ProductosRepository.crearProducto(newProducto)
            res.status(201).json({message:"Producto creado", id: result})
        }catch(error){
            res.status(500).json({message:"Error al crear el producto", error})
            console.error("Error al crear el producto:", error)
        }
    }

    /**
     * Obtiene todos los productos (sin detalles adicionales)
     * 
     * Ruta: GET /productos/obtenerProductos
     * 
     * Respuesta exitosa (200): {message: "...", data: [productos]}
     * Errores: 404 (no hay productos), 500 (error del servidor)
     * 
     * Nota: Este método retorna solo la información básica de la tabla productos.
     * No incluye nombres de categorías, tiendas ni variantes.
     */
    static async getProducts(req:Request,res:Response){
        try{
            const producto = await ProductosRepository.obtenerProductos()   
            return !producto ? res.status(404).json({message:"No se encontraron productos"}) : res.status(200).json({message:"Productos obtenidos correctamente", data:producto})
        }catch(error){
            res.status(500).json({message:"Error al obtener los productos", error})
            console.error("Error al obtener los productos:", error)
        }
    }

    /**
     * Obtiene un producto específico por su ID
     * 
     * Ruta: GET /productos/obtenerProducto/:id
     * Parámetro: id (número)
     * 
     * Respuesta exitosa (200): {message: "...", data: producto}
     * Errores: 404 (producto no encontrado), 500 (error del servidor)
     */
    static async getProductById(req:Request,res:Response){
        try{
            const {id} = req.params
            const producto = await ProductosRepository.obtenerProductoPorId(Number(id))
            res.status(200).json({message:"Producto obtenido correctamente", data:producto})
            return !producto ? res.status(404).json({message:"Producto no encontrado"}) : null
        }catch(error){
            res.status(500).json({message:"Error al obtener el producto", error})
            console.error("Error al obtener el producto:", error)
        }
    }

    /**
     * Actualiza un producto existente
     * 
     * Ruta: PATCH /productos/actualizarProducto/:id
     * Parámetro: id (número)
     * 
     * Body: Solo los campos que se quieren actualizar
     * Ejemplo: {"nombre": "Nuevo nombre"} o {"precio": 1000, "stock": 50}
     * 
     * Respuesta exitosa (200): {message: "...", data: result}
     * Errores: 404 (producto no encontrado), 500 (error del servidor)
     */
    static async updateProductById(req:Request,res:Response){
        try{
            const{id} = req.params
            const productoUpdates:Partial<ProductosDto> = req.body
            const result = await ProductosRepository.actualizarProductoPorId(Number(id),productoUpdates)
            res.status(200).json({message:"Producto actualizado correctamente", data:result})
            return !result ? res.status(404).json({message:"Producto no encontrado"}) : null
        }catch(error){
            res.status(500).json({message:"Error al actualizar el producto", error})
            console.error("Error al actualizar el producto:", error)
        }
    }

    /**
     * Elimina un producto por su ID
     * 
     * Ruta: DELETE /productos/eliminarProducto/:id
     * Parámetro: id (número)
     * 
     * Respuesta exitosa (200): {message: "...", data: result}
     * Errores: 404 (producto no encontrado), 500 (error del servidor)
     * 
     * Nota: Si el producto tiene variantes asociadas, también se eliminarán.
     */
    static async deleteProductById(req:Request,res:Response){
        try{
            const {id} = req.params
            const result = await ProductosRepository.eliminarProductoPorId(Number(id))
            res.status(200).json({message:"Producto eliminado correctamente", data:result})
            return !result ? res.status(404).json({message:"Producto no encontrado"}) : null
        }catch(error){
            res.status(500).json({message:"Error al eliminar el producto", error})
            console.error("Error al eliminar el producto:", error)
        }
    }

    /**
     * Obtiene productos con información completa filtrados por tienda Y categoría
     * 
     * Ruta: GET /productos/obtenerProductosConDetalles/:tienda_id/:category_id
     * Parámetros:
     *   - tienda_id: ID de la tienda
     *   - category_id: ID de la categoría
     * 
     * Ejemplo: GET /productos/obtenerProductosConDetalles/1/2
     * (Obtiene productos de la tienda 1, categoría 2)
     * 
     * Retorna:
     *   - Información completa del producto
     *   - Nombre de la categoría y tienda
     *   - TODAS las variantes (tallas, colores, stock, precios)
     * 
     * Respuesta exitosa (200): {message: "...", data: [productos con variantes]}
     * Errores: 400 (faltan parámetros), 404 (no hay productos), 500 (error del servidor)
     * 
     * Caso de uso: Mostrar productos de una categoría específica en la tienda
     */
    static async getProductsWithDetails(req:Request,res:Response){
        try{
            const {tienda_id, category_id} = req.params
            // Validar que ambos parámetros estén presentes
            if(!tienda_id || !category_id){
                res.status(400).json({message:"Faltan parámetros: tienda_id y category_id son requeridos"})
                return
            }
            const productos = await ProductosRepository.obtenerProductosConDetalles(Number(tienda_id), Number(category_id))
            return !productos || productos.length === 0
                ? res.status(404).json({message:"No se encontraron productos con detalles"}) 
                : res.status(200).json({message:"Productos con detalles obtenidos correctamente", data:productos})
        }catch(error){
            res.status(500).json({message:"Error al obtener los productos con detalles", error})
            console.error("Error al obtener los productos con detalles:", error)
        }
    }

    /**
     * Obtiene TODOS los productos de una tienda (sin filtrar por categoría)
     * 
     * Ruta: GET /productos/obtenerProductosPorTienda/:tienda_id
     * Parámetro: tienda_id (ID de la tienda)
     * 
     * Ejemplo: GET /productos/obtenerProductosPorTienda/1
     * (Obtiene TODOS los productos de la tienda 1)
     * 
     * Retorna:
     *   - Información completa del producto
     *   - Nombre de la categoría y tienda
     *   - NO incluye variantes (para eso usar getProductsWithDetails)
     * 
     * Respuesta exitosa (200): {message: "...", data: [productos]}
     * Errores: 404 (no hay productos), 500 (error del servidor)
     * 
     * Caso de uso: Mostrar el catálogo completo de una tienda
     */
    static async getProductsByStore(req:Request,res:Response){
        try{
            const {tienda_id} = req.params
            const productos = await ProductosRepository.obtenerProductosPorTienda(Number(tienda_id))
            return !productos || productos.length === 0 
                ? res.status(404).json({message:"No se encontraron productos para esta tienda"}) 
                : res.status(200).json({message:"Productos obtenidos correctamente", data:productos})
        }catch(error){
            res.status(500).json({message:"Error al obtener los productos por tienda", error})
            console.error("Error al obtener los productos por tienda:", error)
        }
    }
}
