"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionesRepository = void 0;
const db_config_js_1 = __importDefault(require("../config/db-config.js"));
class TransaccionesRepository {
    static async create(transaccion) {
        const { numero_de_cuenta, tipo_de_cuenta, banco, id_user } = transaccion;
        const [result] = await db_config_js_1.default.query("INSERT INTO transacciones (numero_de_cuenta, tipo_de_cuenta, banco, id_user) VALUES (?, ?, ?, ?)", [numero_de_cuenta, tipo_de_cuenta, banco, id_user]);
        return result;
    }
    static async findByAccount(numero_de_cuenta) {
        const [rows] = await db_config_js_1.default.query("SELECT * FROM transacciones WHERE numero_de_cuenta = ?", [numero_de_cuenta]);
        return rows[0];
    }
    static async findAccountsByUserId(id_user) {
        const [rows] = await db_config_js_1.default.query("SELECT * FROM transacciones WHERE id_user = ?", [id_user]);
        return rows;
    }
    static async updateAccountsByUserId(sql, values) {
        const [resultDb] = await db_config_js_1.default.query(sql, values);
        if (resultDb.affectedRows === 0) {
            return null;
        }
        return resultDb;
    }
    static async deleteAccountsByUserId(id, id_user) {
        const [resultDb] = await db_config_js_1.default.query("DELETE FROM transacciones WHERE id = ? AND id_user = ?", [id, id_user]);
        if (resultDb.affectedRows === 0) {
            return;
        }
        return resultDb;
    }
}
exports.TransaccionesRepository = TransaccionesRepository;
//# sourceMappingURL=transaccionesRepository.js.map