drop database craftyourstyle;
create database craftyourstyle;

use craftyourstyle;
select * from usuarios;
describe usuarios;

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

create table variantes_productos(
	id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    size VARCHAR(10) NOT NULL, 
    color VARCHAR(50) NOT NULL,    
    stock INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categoria(id)
);

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

create table transacciones(
	numero_de_cuenta varchar(100) not null,
    tipo_de_cuenta enum("debito","credito"),
    banco varchar(50) null,
    id_user INT,
    FOREIGN KEY (id_user) REFERENCES usuarios(id)
);

create table notificaciones(
	tipo_de_notificacion enum("mensaje de texto","correo electronico","push"),
    mensaje varchar(250) not null
);