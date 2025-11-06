create database if not exists CraftYourStyle_Personalizacion

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
    variant_id int null
);