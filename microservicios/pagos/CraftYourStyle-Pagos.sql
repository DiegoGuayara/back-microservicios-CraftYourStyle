create database if not exists CraftYourStyle_Pagos;

use CraftYourStyle_Pagos;

create table if not exists payment_intents (
  id int auto_increment primary key,
  order_id varchar(100) not null,
  user_id int not null,
  external_reference varchar(120) not null,
  amount decimal(12,2) not null,
  currency varchar(10) not null,
  status varchar(30) not null,
  mp_preference_id varchar(80) null,
  mp_payment_id varchar(80) null,
  init_point text null,
  sandbox_init_point text null,
  idempotency_key varchar(120) not null,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp on update current_timestamp,
  unique key uq_payment_external_reference (external_reference),
  unique key uq_payment_idempotency_key (idempotency_key),
  index idx_payment_status (status),
  index idx_payment_user (user_id)
);

create table if not exists payment_events (
  id bigint auto_increment primary key,
  external_reference varchar(120) not null,
  event_type varchar(80) not null,
  payload_json json not null,
  processed_at timestamp default current_timestamp,
  index idx_payment_events_reference (external_reference),
  index idx_payment_events_type (event_type)
);

create table if not exists webhook_receipts (
  id bigint auto_increment primary key,
  mp_topic varchar(50) not null,
  mp_resource_id varchar(80) null,
  signature_valid tinyint(1) not null default 0,
  raw_body longtext not null,
  received_at timestamp default current_timestamp,
  index idx_webhook_topic (mp_topic),
  index idx_webhook_resource (mp_resource_id)
);
