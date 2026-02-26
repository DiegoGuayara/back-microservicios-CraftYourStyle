create database craftyourstyle_administrador;

use craftyourstyle_administrador;

CREATE TABLE administradores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT NOT NULL, -- referencia lógica, SIN FK
  nivel ENUM('admin','superadmin') NOT NULL DEFAULT 'admin',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permisos_administradores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,          -- Identificador único del permiso
  id_admin BIGINT NOT NULL,                      -- Relaciona con administrador
  permiso VARCHAR(100) NOT NULL,                 -- Nombre del permiso, ej: 'gestionar_productos'
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
  UNIQUE KEY uq_permiso_admin (id_admin, permiso),    -- Evita permisos duplicados
  KEY idx_permiso_admin (id_admin),             -- Índice para búsquedas por admin
  CONSTRAINT fk_permisos_admin
    FOREIGN KEY (id_admin) REFERENCES administradores(id)
    ON DELETE CASCADE
);

CREATE TABLE auditoria_administradores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,          -- ID único del registro
  id_admin BIGINT NOT NULL,                      -- ID del admin que hizo la acción
  accion VARCHAR(120) NOT NULL,                  -- Qué acción realizó, ej: 'crear_producto'
  entidad VARCHAR(80) NOT NULL,                 -- Sobre qué entidad actuó, ej: 'producto'
  id_entidad BIGINT NULL,                        -- ID específico del objeto afectado
  detalle JSON NULL,                             -- Información adicional de la acción
  ip VARCHAR(45) NULL,                           -- IP desde donde se hizo la acción
  navegador VARCHAR(255) NULL,                   -- User agent del navegador
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de registro
  KEY idx_auditoria_admin (id_admin),
  KEY idx_auditoria_fecha (fecha_creacion),
  CONSTRAINT fk_auditoria_admin
    FOREIGN KEY (id_admin) REFERENCES administradores(id)
    ON DELETE RESTRICT
);