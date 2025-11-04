create database if not exists CraftYourStyle-Personalizacion

use CraftYourStyle-Personalizacion;

create table personalizacion(
	id INT AUTO_INCREMENT PRIMARY KEY,
	color varchar(7) default "#fffff",
    image_url VARCHAR(255),
    textos varchar(100),
    tipo_letra varchar(100),
     FOREIGN KEY (variant_id) REFERENCES variantes_productos(id)
);

create table imagenes(
	id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (variant_id) REFERENCES variantes_productos(id)
);