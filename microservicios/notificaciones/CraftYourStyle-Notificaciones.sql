create database if not exists CraftYourStyle_Notificaciones;

use CraftYourStyle_Notificaciones;

create table notificaciones(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo_de_notificacion enum("mensaje_texto","correo_electronico","push") not null,
    mensaje varchar(250) not null
);
