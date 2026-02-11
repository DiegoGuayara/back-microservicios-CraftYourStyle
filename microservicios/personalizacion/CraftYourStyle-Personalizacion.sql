create database if not exists CraftYourStyle_Personalizacion;

use CraftYourStyle_Personalizacion;

create table personalizacion(
	id INT AUTO_INCREMENT PRIMARY KEY,
	color varchar(7) default "#fffff",
    image_url VARCHAR(255),
    textos varchar(100),
    tipo_letra varchar(100),
    variant_id int null
);

create table imagenes(
	id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    variant_id int null,
    tipo ENUM('producto', 'usuario_diseño', 'logo') DEFAULT 'producto'
);

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