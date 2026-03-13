create database if not exists CraftYourStyle_Transacciones;

use CraftYourStyle_Transacciones;

create table if not exists bancos(
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre varchar(80) not null unique,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
);

create table if not exists transacciones(
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_de_cuenta varchar(100) not null,
  tipo_de_cuenta enum("debito","credito"),
  banco varchar(50) null,
  id_user INT
);

insert ignore into bancos (nombre) values
  ("Bancolombia"),
  ("Banco de Bogota"),
  ("Davivienda"),
  ("Banco de Occidente"),
  ("BBVA");
