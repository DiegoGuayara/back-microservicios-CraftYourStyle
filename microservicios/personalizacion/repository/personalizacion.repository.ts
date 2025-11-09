import type { PersonalizacionDto } from '../DTO/personalizacionDto.js'
import pool from '../config/db-config.js'

export class PersonalizacionRepository {
    static async create(personalizacion: PersonalizacionDto ){
        const { color, image_url, textos, tipo_letra, variant_id } = personalizacion;
        const [result] = await pool.query(
            "INSERT INTO personalizacion (color, image_url, textos, tipo_letra, variant_id) VALUES (?, ?, ?, ?, ?)",
            [color, image_url, textos, tipo_letra, variant_id]
        );
        return result;
    }

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

   static async updatePersonalizationById(id: number, fieldsToUpdate: Partial<PersonalizacionDto>) {
        // Filtra los campos que realmente vienen definidos
        const keys = Object.keys(fieldsToUpdate);
        if (keys.length === 0) {
            return null; // nada que actualizar
        }

        // Construye las partes del SQL dinámicamente
        const setClause = keys.map(key => `${key} = ?`).join(", ");
        const values = Object.values(fieldsToUpdate);

        const sql = `UPDATE personalization SET ${setClause} WHERE id = ?`;
        values.push(id); // último valor es el ID

        const [result]:any = await pool.query(sql, values); // resul = await pool.query(sql, values);
        if (result.affectedRows === 0) {
            return null;
        }

        return result;
    }

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

    static async getPersonalization() {
        const [rows]: any = await pool.query('select * from personalizacion')
        return rows;
    }

}