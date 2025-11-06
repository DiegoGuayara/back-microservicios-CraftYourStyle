create database if not exists CraftYourStyle_Transacciones;

use CraftYourStyle_Transacciones;

create table transacciones(
	id INT AUTO_INCREMENT PRIMARY KEY,
	numero_de_cuenta varchar(100) not null,
    tipo_de_cuenta enum("debito","credito"),
    banco varchar(50) null,
    id_user INT
);