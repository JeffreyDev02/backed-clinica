-- Crear tabla de usuarios con soporte para login
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre`     varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email`      varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password`   varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rol`        enum('admin','medico','recepcion') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'recepcion',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Si la tabla ya existe y le faltan las columnas nuevas, ejecuta esto:
-- ALTER TABLE usuario ADD COLUMN password varchar(255) NOT NULL AFTER email;
-- ALTER TABLE usuario ADD COLUMN rol enum('admin','medico','recepcion') NOT NULL DEFAULT 'recepcion' AFTER password;
-- ALTER TABLE usuario ADD UNIQUE KEY email (email);

-- ── Usuario de prueba (contraseña: Admin1234) ──────────────
-- Hash generado con bcrypt rounds=10  (ejecutar el script hash_password.js para regenerar)
-- INSERT INTO usuario (nombre, email, password, rol) VALUES
-- ('Admin', 'admin@mediconnect.com', '$2b$10$HASH_AQUI', 'admin');
-- 
-- USA el endpoint POST /api/users/seed-admin para insertar el admin con hash correcto.
