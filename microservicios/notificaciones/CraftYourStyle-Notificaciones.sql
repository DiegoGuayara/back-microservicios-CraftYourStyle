create table notificaciones(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo_de_notificacion enum("mensaje de texto","correo electronico","push"),
    mensaje varchar(250) not null
);