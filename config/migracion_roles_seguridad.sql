USE clinica_medica;

-- Ejecutar una sola vez en bases existentes.
ALTER TABLE consulta ADD COLUMN comentarios TEXT NULL;
ALTER TABLE usuario MODIFY COLUMN rol ENUM('admin','medico','recepcion') NOT NULL;

INSERT INTO usuario (nombre, email, password, rol) VALUES
('Médico General', 'medico@mediconnect.com', '$2b$10$bbGn9WbSFTmK62VS34eonO3wtZFK7F8pf0SMcaUTnvhbphBQq2Vcy', 'medico'),
('Recepción', 'recepcion@mediconnect.com', '$2b$10$g.hg2pCFEvyKu.x9DcDJwefavLQmKpmntWwcpYDWGwB3.tp/vr/cy', 'recepcion')
AS nuevo
ON DUPLICATE KEY UPDATE nombre = nuevo.nombre, rol = nuevo.rol;

-- Roles admitidos por la aplicación:
-- admin: acceso total.
-- medico: lectura clínica, creación y edición de consultas y recetas.
-- recepcion: gestión de pacientes, citas y facturas.
--
-- Los usuarios se crean únicamente desde la base de datos. La contraseña debe
-- almacenarse como hash bcrypt, nunca como texto plano. Ejemplo:
-- Generar hash: node utils/generarHashPassword.js "TuPassword"
-- INSERT INTO usuario (nombre, email, password, rol)
-- VALUES ('Recepción', 'recepcion@mediconnect.com', '<HASH_BCRYPT>', 'recepcion');
