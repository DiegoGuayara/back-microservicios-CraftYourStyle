CREATE DATABASE IF NOT EXISTS CraftYourStyle_Catalogo;

USE CraftYourStyle_Catalogo;

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (tienda_id) REFERENCES tienda(id) ON DELETE CASCADE
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    image_url VARCHAR(255),
    descripcion varchar(100),
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    talla VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categoria(id) ON DELETE CASCADE
);

CREATE TABLE verificacionPrenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock ENUM('En espera', 'Disponible', 'Agotado') NOT NULL,
    producto_id INT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
)