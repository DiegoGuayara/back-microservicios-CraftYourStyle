/**
 * Repository de Personalización
 * 
 * Maneja todas las operaciones de base de datos relacionadas con personalizaciones.
 * Permite a los usuarios personalizar productos con colores, imágenes, textos y fuentes.
 */

import type { PersonalizacionDto } from '../DTO/personalizacionDto.js'
import pool from '../config/db-config.js'

export class PersonalizacionRepository {
    /**
     * Crea una nueva personalización en la base de datos
     * 
     * @param personalizacion - Objeto con los datos de personalización:
     *   - color: Código hexadecimal del color (ej: "#FF5733")
     *   - image_url: URL de la imagen personalizada
     *   - textos: Texto que se agregará al producto
     *   - tipo_letra: Fuente tipográfica del texto (ej: "Arial", "Times New Roman")
     *   - variant_id: ID de la variante de producto a personalizar
     * 
     * @returns Resultado de la inserción con el ID de la personalización creada
     */
    static async create(personalizacion: PersonalizacionDto ){
        const { color, image_url, textos, tipo_letra, variant_id } = personalizacion;
        const [result] = await pool.query(
            "INSERT INTO personalizacion (color, image_url, textos, tipo_letra, variant_id) VALUES (?, ?, ?, ?, ?)",
            [color, image_url, textos, tipo_letra, variant_id]
        );
        return result;
    }

    /**
     * Busca una personalización por su ID
     * 
     * @param id - ID de la personalización a buscar
     * @returns Objeto con los datos de la personalización si existe, null si no se encuentra
     */
    static async findBypersonalizationId(id: number) {
        const [rows]: any = await pool.query(
            "SELECT * FROM personalizacion WHERE id = ?",
            [id]
        );
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    }

   /**
    * Actualiza una personalización existente por su ID
    * 
    * @param id - ID de la personalización a actualizar
    * @param fieldsToUpdate - Objeto con los campos a actualizar (puede ser parcial)
    *   Ejemplo: {color: "#FF0000"} o {textos: "Nuevo texto", tipo_letra: "Arial"}
    * 
    * @returns Resultado de la actualización si exitoso, null si no se encontró o no hay campos
    * 
    * Nota: Este método es dinámico, solo actualiza los campos enviados.
    * No es necesario enviar todos los campos, solo los que se quieren modificar.
    */
   static async updatePersonalizationById(id: number, fieldsToUpdate: Partial<PersonalizacionDto>) {
        // Filtra los campos que realmente vienen definidos
        const keys = Object.keys(fieldsToUpdate);
        if (keys.length === 0) {
            return null; // nada que actualizar
        }

        // Construye las partes del SQL dinámicamente
        const setClause = keys.map(key => `${key} = ?`).join(", ");
        const values = Object.values(fieldsToUpdate);

        const sql = `UPDATE personalizacion SET ${setClause} WHERE id = ?`;
        values.push(id); // último valor es el ID

        const [result]:any = await pool.query(sql, values);
        if (result.affectedRows === 0) {
            return null;
        }

        return result;
    }

    /**
     * Elimina una personalización por su ID
     * 
     * @param id - ID de la personalización a eliminar
     * @returns Resultado de la eliminación si exitoso, null si no se encontró
     */
    static async deletePersonalizationById(id: number) {
        const [resultDb]: any = await pool.query(
            "DELETE FROM personalizacion WHERE id = ?",
            [id]
        );

        if (resultDb.affectedRows === 0) {
            return null;
        }

        return resultDb;
    }

    /**
     * Obtiene todas las personalizaciones de la base de datos
     * 
     * @returns Array con todas las personalizaciones registradas
     */
    static async getPersonalization() {
        const [rows]: any = await pool.query('SELECT * FROM personalizacion')
        return rows;
    }

}