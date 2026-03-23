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

create table if not exists pagos_epayco(
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id varchar(120) not null,
  user_id INT not null,
  provider enum("epayco","mock") not null default "epayco",
  provider_reference varchar(160) not null unique,
  epayco_ref varchar(160) null,
  transaction_id varchar(160) null,
  amount decimal(12,2) not null,
  currency varchar(10) not null default "COP",
  description varchar(255) not null,
  status enum("PENDIENTE","APROBADA","RECHAZADA","CANCELADA","EXPIRADA","ERROR") not null default "PENDIENTE",
  raw_response longtext null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp
);

insert ignore into bancos (nombre) values
  ("Bancolombia"),
  ("Banco de Bogota"),
  ("Davivienda"),
  ("Banco de Occidente"),
  ("BBVA");
