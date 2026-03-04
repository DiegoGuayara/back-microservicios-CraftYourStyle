create database factura;

use factura;

CREATE TABLE facturas (
    id UUID PRIMARY KEY,
    id_usuario VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(150) NOT NULL,
    correo_usuario VARCHAR(150) NOT NULL,
    total_productos INTEGER NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    fecha_emision TIMESTAMP NOT NULL,
    fecha_vencimiento TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_factura (
    id SERIAL PRIMARY KEY,
    id_factura UUID REFERENCES facturas(id) ON DELETE CASCADE,
    nombre_producto VARCHAR(150) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    cantidad INTEGER NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);