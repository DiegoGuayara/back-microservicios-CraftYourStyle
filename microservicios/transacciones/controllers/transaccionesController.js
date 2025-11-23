"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionesController = void 0;
const transaccionesRepository_js_1 = require("../repository/transaccionesRepository.js");
const axios_1 = __importDefault(require("axios"));
class TransaccionesController {
    static async crearTransaccion(req, res) {
        try {
            const { numero_de_cuenta, tipo_de_cuenta, banco, id_user } = req.body;
            const newTransaccion = {
                numero_de_cuenta,
                tipo_de_cuenta,
                banco,
                id_user,
            };
            const existingNumber = await transaccionesRepository_js_1.TransaccionesRepository.findByAccount(numero_de_cuenta);
            if (existingNumber) {
                res.status(400).json({ message: "Esta cuenta ya existe" });
                return;
            }
            const result = await transaccionesRepository_js_1.TransaccionesRepository.create(newTransaccion);
            res.status(201).json({ message: "Transacción creada", id: result });
        }
        catch (error) {
            res.status(500).json({ message: "Error al crear la transacción", error });
            console.error("Error al crear la transacción:", error);
        }
    }
    static async obtenerCuentas(req, res) {
        try {
            const { id_user } = req.params;
            const cuenta = await transaccionesRepository_js_1.TransaccionesRepository.findAccountsByUserId(Number(id_user));
            const { data } = await axios_1.default.get(`http://localhost:8080/v1/usuarios/${id_user}`);
            const { contraseña, ...usuarioSinContraseña } = data.usuario;
            res.status(200).json({
                usuario: usuarioSinContraseña,
                cuentas: cuenta,
            });
        }
        catch (error) {
            console.error("Error obteniendo transacciones:", error.message);
            return res.status(500).json({ mensaje: "Error obteniendo información" });
        }
    }
    static async updateUser(req, res) {
        try {
            const { id, id_user } = req.params;
            const camposAct = req.body;
            const columns = [];
            const values = [];
            for (let [key, value] of Object.entries(camposAct)) {
                if (value !== undefined && value !== null && value !== "") {
                    columns.push(`${key} = ?`);
                    values.push(value);
                }
            }
            if (columns.length === 0) {
                res.status(400).json({
                    message: "No fields to update",
                });
                return;
            }
            const sql = `UPDATE transacciones SET ${columns.join(", ")} WHERE id_user = ? AND id = ?`;
            values.push(Number(id_user));
            values.push(Number(id));
            const resultDb = await transaccionesRepository_js_1.TransaccionesRepository.updateAccountsByUserId(sql, values);
            res.status(200).json({
                message: "User updated successfully",
                user: {
                    result: resultDb,
                    ...camposAct,
                },
            });
        }
        catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
    static async eliminarCuenta(req, res) {
        try {
            const { id, id_user } = req.params;
            const resultDb = await transaccionesRepository_js_1.TransaccionesRepository.deleteAccountsByUserId(Number(id), Number(id_user));
            if (!resultDb) {
                res.status(404).json({ message: "Cuenta no encontrada" });
                return;
            }
            res.status(200).json({ message: "Cuenta eliminada correctamente" });
        }
        catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            res.status(500).json({ message: "Error al eliminar la cuenta", error });
        }
    }
}
exports.TransaccionesController = TransaccionesController;
//# sourceMappingURL=transaccionesController.js.map