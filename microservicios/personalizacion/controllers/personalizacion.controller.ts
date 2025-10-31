import type{ Request,Response } from "express";
import { PersonalizacionRepository } from "../repository/personalizacion.repository.js";
import type { PersonalizacionDto } from '../DTO/personalizacionDto.js'

export class PersonalizacionController{
    static async getPersonalization(req: Request, res: Response) {
        const personalization = await PersonalizacionRepository.getPersonalization();
        res.json(personalization);
    } 
    
    static async crearPersonalizacion(req: Request, res: Response){
        try {
            const { color, image_url, textos, tipo_de_fuente,id } = req.body;
            const newPersonalization: PersonalizacionDto = {
                color,
                image_url,
                textos,
                tipo_de_fuente,
                id
            };

           if(!color || !image_url || !textos || !tipo_de_fuente){
            res.status(400).json({ message: "Faltan datos obligatorios" });
            return;
           }
            
            const result = await PersonalizacionRepository.create(newPersonalization);
            res.status(201).json({ message: "Personalización creada", id: result });
        } catch (error) {
            res.status(500).json({ message: "Error al crear la personalización", error });
            console.error("Error al crear la personalización:", error);
        }
    }

    static async getPersonalizationById(req: Request, res: Response){
        try {
            const { id } = req.params;
            const personalization = await PersonalizacionRepository.findBypersonalizationId(Number(id));
            if (!personalization) {
                res.status(404).json({ message: "Personalización no encontrada" });
                return;
            }
            return res.status(200).json({
                message: "Personalización obtenida correctamente",
                data: personalization
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener la personalización", error });
            console.error("Error al obtener la personalización:", error);
        }
    }
}