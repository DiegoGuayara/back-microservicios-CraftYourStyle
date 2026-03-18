create database if not exists CraftYourStyle_AgenteIA;

use CraftYourStyle_AgenteIA;

create table imagenes_ia(
	id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    variant_id int null,
    id_user INT NULL,
    tipo ENUM('producto', 'usuario_diseño', 'logo') DEFAULT 'producto',
    prompt TEXT NULL,
    garment_type VARCHAR(50) NULL,
    estado ENUM('pendiente','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    precio DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


ALTER TABLE imagenes_ia
  MODIFY COLUMN tipo ENUM('producto','usuario_diseño','logo')
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

UPDATE imagenes_ia
SET tipo = 'usuario_diseño'
WHERE tipo = 'usuario_dise?o';

CREATE TABLE sesiones_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    estado ENUM('activa', 'finalizada') DEFAULT 'activa'
);

-- Historial de mensajes
CREATE TABLE mensajes_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id INT NOT NULL,
    tipo ENUM('usuario', 'ia') NOT NULL,
    contenido TEXT NOT NULL,
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id) REFERENCES sesiones_ia(id)
);

-- Fotos del usuario para try-on
CREATE TABLE fotos_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    foto_url VARCHAR(255) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE personalizacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resultados de virtual try-on
CREATE TABLE pruebas_virtuales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    foto_usuario_id INT NOT NULL,
    personalizacion_id INT NULL,
    variant_id INT NULL,
    imagen_resultado_url VARCHAR(255) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    favorito BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (foto_usuario_id) REFERENCES fotos_usuario(id),
    FOREIGN KEY (personalizacion_id) REFERENCES personalizacion(id)
);