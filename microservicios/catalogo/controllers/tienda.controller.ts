import { Request,Response} from "express";
import { TiendaRepository } from "../repository/tienda.repository.js";
import type { TiendaDto } from "../DTO/tiendaDto.js";

export class TiendaController{
    static async createStore(req:Request, res:Response){
        try{
            const {nombre} = req.body
            if(!nombre){
                res.status(400).json({message:"Faltan datos obligatorios"})
                return
            }
            const newTienda:TiendaDto = {
                nombre:nombre
            }
            const result = await TiendaRepository.crearTienda(newTienda)
            res.status(201).json({message:"Tienda creada", data:result})
        }catch(error){
            res.status(500).json({message:"Error al crear la tienda", error})
            console.error("Error al crear la tienda:", error)
        }
    }

    static async getStores(req:Request, res:Response){
        try{
            const tiendas = await TiendaRepository.obtenerTiendas()
            return !tiendas ? res.status(404).json({message:"No se encontraron tiendas"}) : res.status(200).json({message:"Tiendas obtenidas correctamente", data:tiendas})
        }catch(error){
            res.status(500).json({message:"Error al obtener las tiendas", error})
            console.error("Error al obtener las tiendas:", error)
        }
    }

    static async getStoreById(req:Request, res:Response){
        try{
            const {id} = req.params
            const tienda = await TiendaRepository.obtenerTiendaPorId(Number(id))
            return !tienda ? res.status(404).json({message:"Tienda no encontrada"}) : res.status(200).json({message:"Tienda obtenida correctamente", data:tienda})
        }catch(error){
            res.status(500).json({message:"Error al obtener la tienda", error})
            console.error("Error al obtener la tienda:", error)
        }
    }

    static async updateStoreById(req:Request, res:Response){
        try{
            const {id} = req.params
            const tiendaUpdates:Partial<TiendaDto> = req.body   
            const result = await TiendaRepository.actualizarTiendaPorId(Number(id), tiendaUpdates)
            return !result ? res.status(404).json({message:"Tienda no encontrada"}) : res.status(200).json({message:"Tienda actualizada correctamente", data:result})
        }catch(error){
            res.status(500).json({message:"Error al actualizar la tienda", error})
            console.error("Error al actualizar la tienda:", error)
        }    
    }

    static async deleteStoreById(req:Request, res:Response){
        try{
            const {id} = req.params
            const result = await TiendaRepository.eliminarTiendaPorId(Number(id))
            return !result ? res.status(404).json({message:"Tienda no encontrada"}) : res.status(200).json({message:"Tienda eliminada correctamente", data:result})
        }catch(error){
            res.status(500).json({message:"Error al eliminar la tienda", error})
            console.error("Error al eliminar la tienda:", error)
        }
    }
}