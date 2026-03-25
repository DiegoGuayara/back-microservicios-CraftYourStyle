CREATE DATABASE IF NOT EXISTS CraftYourStyle_Catalogo;

USE CraftYourStyle_Catalogo;

CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    image_url VARCHAR(255),
    descripcion varchar(100),
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    talla VARCHAR(10) NOT NULL,
    genero VARCHAR(30) NOT NULL DEFAULT 'Unisex',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categoria(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verificacionPrenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock ENUM('En espera', 'Disponible', 'Agotado') NOT NULL,
    producto_id INT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Migracion para bases existentes: agrega la columna genero si aun no existe.
SET @column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CraftYourStyle_Catalogo'
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'genero'
);

SET @add_genero_sql := IF(
    @column_exists = 0,
    'ALTER TABLE productos ADD COLUMN genero VARCHAR(30) NOT NULL DEFAULT ''Unisex'' AFTER talla',
    'SELECT ''La columna genero ya existe'''
);

PREPARE stmt FROM @add_genero_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migracion para bases existentes: agrega la columna stock si aun no existe.
SET @stock_column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CraftYourStyle_Catalogo'
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'stock'
);

SET @add_stock_sql := IF(
    @stock_column_exists = 0,
    'ALTER TABLE productos ADD COLUMN stock INT NOT NULL DEFAULT 0 AFTER price',
    'SELECT ''La columna stock ya existe'''
);

PREPARE stmt FROM @add_stock_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
