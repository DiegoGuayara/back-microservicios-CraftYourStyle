"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "craftyourstyle",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: Number(process.env.DB_PORT) || 3306,
});
const verifyConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Conexión a la base de datos exitosa");
        connection.release();
    }
    catch (error) {
        console.error("Error de conexión a la base de datos:", error);
        process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
    }
};
verifyConnection();
exports.default = pool;
//# sourceMappingURL=db-config.js.map