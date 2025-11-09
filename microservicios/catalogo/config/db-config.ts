import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
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
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error);
    process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
  }
};
verifyConnection()

export default pool
