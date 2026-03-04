create database factura;

use factura;

CREATE TABLE facturas (
    id CHAR(36) PRIMARY KEY,
    id_usuario VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(150) NOT NULL,
    correo_usuario VARCHAR(150) NOT NULL,
    total_productos INTEGER NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    fecha_emision DATETIME NOT NULL,
    fecha_vencimiento DATETIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_factura (
    id SERIAL PRIMARY KEY,
    id_factura CHAR(36) NOT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    cantidad INTEGER NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_detalle_factura
        FOREIGN KEY (id_factura) REFERENCES facturas(id)
        ON DELETE CASCADE
);
