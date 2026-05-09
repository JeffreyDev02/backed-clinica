-- ============================================================
-- LOGIN SETUP — MediConnect
-- Ejecutar en la base de datos clinica_medica
-- ============================================================

-- 1. Si la tabla usuario ya existe sin las nuevas columnas, agrégalas:
ALTER TABLE usuario
  ADD COLUMN password varchar(255) NOT NULL DEFAULT '' AFTER email,
  ADD COLUMN rol enum('admin','medico','recepcion') NOT NULL DEFAULT 'recepcion' AFTER password;

-- Asegurar unicidad de email (omitir si ya existe el índice)
ALTER TABLE usuario ADD UNIQUE KEY idx_usuario_email (email);

-- ============================================================
-- 2. Para insertar el usuario admin con contraseña hasheada,
--    usa el endpoint del backend (no insertes el hash manualmente):
--
--    POST http://localhost:3000/api/users/seed-admin
--    Content-Type: application/json
--    {
--      "nombre":   "Admin",
--      "email":    "admin@mediconnect.com",
--      "password": "Admin1234",
--      "rol":      "admin"
--    }
--
--    Esto guardará el hash bcrypt correcto en la base de datos.
-- ============================================================

-- Credenciales de acceso al sistema:
--   Email:      admin@mediconnect.com
--   Contraseña: Admin1234
