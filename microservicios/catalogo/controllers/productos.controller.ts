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
    private static normalizeProductInput(payload: any): ProductosDto {
        const genero = payload.genero ?? payload.gender ?? "Unisex";
        return {
            nombre: payload.nombre ?? payload.name ?? "",
            descripcion: payload.descripcion ?? payload.description,
            imagen_url: payload.imagen_url ?? payload.image_url ?? payload.imagen ?? payload.image,
            categoria_id: Number(payload.categoria_id ?? payload.category_id ?? 0),
            price: Number(payload.price ?? payload.precio ?? 0),
            talla: payload.talla ?? payload.size ?? "",
            genero: typeof genero === "string" ? genero : "Unisex",
        };
    }

    private static toUiProduct(producto: any) {
        return {
            id: producto.id,
            name: producto.nombre ?? producto.producto ?? "",
            category: producto.categoria ?? producto.categoria_id ?? producto.category_id ?? null,
            price: Number(producto.price ?? producto.precio ?? 0),
            stock: Number(producto.stock_total ?? producto.existencias ?? producto.stock ?? 0),
            image: producto.imagen_url ?? producto.image_url ?? producto.image ?? "",
            description: producto.descripcion ?? null,
            size: producto.talla ?? null,
            gender: producto.genero ?? null,
        };
    }
    /**
     * Crea un nuevo producto
     * 
     * Ruta: POST /productos/crearProducto
     * 
     * Body esperado:
     * {
     *   "nombre": "Nombre del producto",
     *   "descripcion": "Descripción del producto",
     *   "imagen_url": "URL de la imagen",
     *   "categoria_id": 1,
     *   "price": 100000,
     *   "talla": "M"
     * }
     * 
     * Respuesta exitosa (201): {message: "Producto creado", id: insertId}
     * Errores: 400 (faltan datos), 500 (error del servidor)
     */
    static async createProduct(req:Request,res:Response){
        try{
        const newProducto:ProductosDto = this.normalizeProductInput(req.body);
        const { nombre, categoria_id, price, talla } = newProducto;
        // Validar que todos los campos obligatorios estén presentes
        if(!nombre || !categoria_id || !Number.isFinite(price) || !talla){
            res.status(400).json({message:"Faltan datos obligatorios"})
            return
        }
            const result: any = await ProductosRepository.crearProducto(newProducto)

            res.status(201).json({
                message:"Producto creado",
                data: {
                    id: result?.insertId ?? null,
                    product: newProducto
                },
                // Compatibilidad
                id: result
            })
        }catch(error){
            console.error("Error al crear el producto:", error)
            res.status(500).json({message:"Error al crear el producto"})
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
            const genero = typeof req.query.genero === "string"
                ? req.query.genero
                : typeof req.query.gender === "string"
                    ? req.query.gender
                    : undefined;
            const producto = await ProductosRepository.obtenerProductos(genero)
            const lista = producto ?? []
            return res.status(200).json({
                message: lista.length > 0
                    ? "Productos obtenidos correctamente"
                    : "No se encontraron productos",
                data: lista,
                data_ui: lista.map((p: any) => this.toUiProduct(p)),
            })
        }catch(error){
            console.error("Error al obtener los productos:", error)
            res.status(500).json({message:"Error al obtener los productos"})
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
            if(!producto) {
                return res.status(404).json({message:"Producto no encontrado"})
            }
            return res.status(200).json({
                message:"Producto obtenido correctamente",
                data:producto,
                data_ui: this.toUiProduct(producto),
            })
        }catch(error){
            console.error("Error al obtener el producto:", error)
            res.status(500).json({message:"Error al obtener el producto"})
        }
    }

    /**
     * Actualiza un producto existente
     * 
     * Ruta: PATCH /productos/actualizarProducto/:id
     * Parámetro: id (número)
     * 
     * Body: Solo los campos que se quieren actualizar
     * Ejemplo: {"nombre": "Nuevo nombre"} o {"precio": 1000, "existencias": 50}
     * 
     * Respuesta exitosa (200): {message: "...", data: result}
     * Errores: 404 (producto no encontrado), 500 (error del servidor)
     */
    static async updateProductById(req:Request,res:Response){
        try{
            const{id} = req.params
            const normalized = this.normalizeProductInput(req.body);
            const productoUpdates:Partial<ProductosDto> = {}
            if (req.body.nombre !== undefined || req.body.name !== undefined) productoUpdates.nombre = normalized.nombre
            if (req.body.descripcion !== undefined || req.body.description !== undefined) productoUpdates.descripcion = normalized.descripcion
            if (req.body.imagen_url !== undefined || req.body.image_url !== undefined || req.body.imagen !== undefined || req.body.image !== undefined) productoUpdates.imagen_url = normalized.imagen_url
            if (req.body.categoria_id !== undefined || req.body.category_id !== undefined) productoUpdates.categoria_id = normalized.categoria_id
            if (req.body.price !== undefined || req.body.precio !== undefined) {
                if (!Number.isFinite(normalized.price) || normalized.price < 0) {
                    return res.status(400).json({message: "El price debe ser un numero valido"});
                }
                productoUpdates.price = normalized.price
            }
            if (req.body.talla !== undefined || req.body.size !== undefined) productoUpdates.talla = normalized.talla
            if (req.body.genero !== undefined || req.body.gender !== undefined) productoUpdates.genero = normalized.genero
            const result = await ProductosRepository.actualizarProductoPorId(Number(id),productoUpdates)
            if(!result) {
                return res.status(404).json({message:"Producto no encontrado"})
            }
            return res.status(200).json({message:"Producto actualizado correctamente", data:result})
        }catch(error){
            console.error("Error al actualizar el producto:", error)
            res.status(500).json({message:"Error al actualizar el producto"})
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
            if(!result) {
                return res.status(404).json({message:"Producto no encontrado"})
            }
            return res.status(200).json({message:"Producto eliminado correctamente", data:result})
        }catch(error){
            console.error("Error al eliminar el producto:", error)
            res.status(500).json({message:"Error al eliminar el producto"})
        }
    }

    /**
     * Obtiene productos con información completa filtrados por categoría
     * 
     * Ruta: GET /productos/obtenerProductosConDetalles/:categoria_id
     * Parámetros:
     *   - categoria_id: ID de la categoría
     * 
     * Ejemplo: GET /productos/obtenerProductosConDetalles/2
     * (Obtiene productos de la categoría 2)
     * 
     * Retorna:
     *   - Información completa del producto
     *   - Nombre de la categoría
     *   - Stock desde verificacionPrenda
     * 
     * Respuesta exitosa (200): {message: "...", data: [productos con variantes]}
     * Errores: 400 (faltan parámetros), 404 (no hay productos), 500 (error del servidor)
     * 
     * Caso de uso: Mostrar productos de una categoría específica
     */
    static async getProductsWithDetails(req:Request,res:Response){
        try{
            const { categoria_id } = req.params
            if(!categoria_id){
                res.status(400).json({message:"Falta parámetro: categoria_id es requerido"})
                return
            }
            const productos = await ProductosRepository.obtenerProductosConDetalles(Number(categoria_id))
            return !productos || productos.length === 0
                ? res.status(404).json({message:"No se encontraron productos con detalles"}) 
                : res.status(200).json({
                    message:"Productos con detalles obtenidos correctamente",
                    data:productos,
                    data_ui: productos.map((p: any) => this.toUiProduct(p)),
                })
        }catch(error){
            console.error("Error al obtener los productos con detalles:", error)
            res.status(500).json({message:"Error al obtener los productos con detalles"})
        }
    }

    static async getProductsByGender(req:Request,res:Response){
        try{
            const { genero } = req.params
            if(!genero){
                return res.status(400).json({message:"Falta parametro: genero es requerido"})
            }
            const productos = await ProductosRepository.obtenerProductos(genero)
            return res.status(200).json({
                message: productos.length > 0
                    ? "Productos por genero obtenidos correctamente"
                    : "No se encontraron productos para el genero solicitado",
                data: productos,
                data_ui: productos.map((p: any) => this.toUiProduct(p)),
            })
        }catch(error){
            console.error("Error al obtener productos por genero:", error)
            res.status(500).json({message:"Error al obtener productos por genero"})
        }
    }
}
