import { Request,Response } from "express";
import { ProductosRepository } from "../repository/productos.repository.js";
import type { ProductosDto } from "../DTO/productosDto.js";

export class ProductoController{
    static async createProduct(req:Request,res:Response){
        try{
        const {nombre, descripcion, imagen, category_id} = req.body
        const newProducto:ProductosDto = {
            nombre,
            descripcion, 
            imagen,
            category_id
        }
        if(!nombre || !descripcion || !imagen || !category_id){
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

    static async getProducts(req:Request,res:Response){
        try{
            const producto = await ProductosRepository.obtenerProductos()
            res.status(200).json({message:"Productos obtenidos correctamente", data:producto})
        }catch(error){
            res.status(500).json({message:"Error al obtener los productos", error})
            console.error("Error al obtener los productos:", error)
        }
    }

    static async getProductById(req:Request,res:Response){
        try{
            const {id} = req.params
            const producto = await ProductosRepository.obtenerProductoPorId(Number(id))
            res.status(200).json({message:"Producto obtenido correctamente", data:producto})
            return !producto ? res.status(404).json({message:"Producto no encontrado"}) : null
            // if(!producto){
            //     res.status(404).json({message:"Producto no encontrado"})
            //     return
            // }
        }catch(error){
            res.status(500).json({message:"Error al obtener el producto", error})
            console.error("Error al obtener el producto:", error)
        }
    }

    static async updateProductById(req:Request,res:Response){
        try{
            const{id} = req.params
            const productoUpdates:Partial<ProductosDto> = req.body
            const result = await ProductosRepository.actualizarProductoPorId(Number(id),productoUpdates)
            res.status(200).json({message:"Producto actualizado correctamente", data:result})
            return !result ? res.status(404).json({message:"Producto no encontrado"}) : null
            // if(!result){
            //     res.status(404).json({message:"Producto no encontrado"})
            //     return
            // }
        }catch(error){
            res.status(500).json({message:"Error al actualizar el producto", error})
            console.error("Error al actualizar el producto:", error)
        }
    }

    static async deleteProductById(req:Request,res:Response){
        try{
            const {id} = req.params
            const result = await ProductosRepository.eliminarProductoPorId(Number(id))
            res.status(200).json({message:"Producto eliminado correctamente", data:result})
            return !result ? res.status(404).json({message:"Producto no encontrado"}) : null
            // if(!result){
            //     res.status(404).json({message:"Producto no encontrado"})
            //     return
            // }
        }catch(error){
            res.status(500).json({message:"Error al eliminar el producto", error})
            console.error("Error al eliminar el producto:", error)
        }
    }
}