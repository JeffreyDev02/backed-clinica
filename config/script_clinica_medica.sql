CREATE DATABASE IF NOT EXISTS clinica_medica;
USE clinica_medica;

-- =========================================
-- TABLA USUARIO
-- =========================================

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol VARCHAR(60) NOT NULL
);

INSERT INTO usuario VALUES
(1,'Admin','admin@mediconnect.com','123456','admin'),
(2,'Jeffrey','jeffrey@gmail.com','123456','admin');

-- =========================================
-- TABLA PACIENTE
-- =========================================

CREATE TABLE paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    direccion VARCHAR(255)
);

INSERT INTO paciente VALUES
(1,'Mario','Castro','1992-01-15','50001111','Zona 5'),
(2,'Elena','Morales','1985-04-20','50002222','Villa Nueva'),
(3,'Ricardo','Flores','1998-08-10','50003333','Mixco'),
(4,'Patricia','Ruiz','2001-03-12','50004444','Amatitlán'),
(5,'Jorge','Navarro','1990-07-01','50005555','Zona 18'),
(6,'Sofia','Herrera','1996-09-22','50006666','Villa Canales'),
(7,'Daniel','Mejia','1987-11-05','50007777','San Cristóbal'),
(8,'Camila','Santos','2000-02-14','50008888','Fraijanes'),
(9,'Hector','Rojas','1979-06-18','50009999','Zona 7'),
(10,'Valeria','Estrada','1994-12-03','50010000','Zona 12'),
(11,'Oscar','Pineda','1983-05-27','50011111','Villa Lobos'),
(12,'Karla','Molina','1997-10-09','50012222','Santa Catarina Pinula'),
(13,'Fernando','Cruz','1991-01-30','50013333','Zona 6'),
(14,'Natalia','Vega','2002-04-17','50014444','Zona 15'),
(15,'Luis','Arriola','1989-09-09','50015555','Mixco');

-- =========================================
-- TABLA MEDICO
-- =========================================

CREATE TABLE medico (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    telefono VARCHAR(20)
);

INSERT INTO medico VALUES
(1,'Kevin','Garcia','69235844'),
(2,'Maria','Silva','95852233'),
(3,'Abner','Silva','00662288'),
(4,'Jonathan','Ramos','78956323'),
(5,'Fernando','Silva','0233224'),
(6,'Esteban','Jorge','54003366'),
(7,'Dionicio','Alex','88005533'),
(8,'Roberto','Maldonado','41110001'),
(9,'Paula','Herrera','41110002'),
(10,'Diego','Lopez','41110003'),
(11,'Melissa','Fuentes','41110004'),
(12,'Carlos','Reyes','41110005'),
(13,'Andrea','Guzman','41110006'),
(14,'Victor','Cano','41110007'),
(15,'Monica','Lara','41110008');

-- =========================================
-- TABLA ESPECIALIDAD
-- =========================================

CREATE TABLE especialidad (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

INSERT INTO especialidad VALUES
(1,'Ginecología'),
(2,'Pediatría'),
(3,'Urología'),
(4,'Medicina General'),
(5,'Neurología'),
(6,'Traumatología'),
(7,'Oftalmología'),
(8,'Psiquiatría'),
(9,'Endocrinología'),
(10,'Oncología'),
(11,'Otorrinolaringología'),
(12,'Nefrología'),
(13,'Reumatología'),
(14,'Gastroenterología'),
(15,'Cirugía General');

-- =========================================
-- TABLA MEDICO_ESPECIALIDAD
-- =========================================

CREATE TABLE medico_especialidad (
    id_medico INT,
    id_especialidad INT,
    PRIMARY KEY(id_medico,id_especialidad),

    FOREIGN KEY(id_medico)
    REFERENCES medico(id_medico)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_especialidad)
    REFERENCES especialidad(id_especialidad)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO medico_especialidad VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),(15,15);

-- =========================================
-- TABLA CITA
-- =========================================

CREATE TABLE cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_medico INT,
    fecha DATE,
    hora TIME,
    estado VARCHAR(50),

    FOREIGN KEY(id_paciente)
    REFERENCES paciente(id_paciente)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_medico)
    REFERENCES medico(id_medico)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO cita VALUES
(1,1,1,'2026-06-05','08:00:00','Normal'),
(2,2,2,'2026-06-05','09:00:00','Urgente'),
(3,3,3,'2026-06-05','10:00:00','Normal'),
(4,4,4,'2026-06-05','11:00:00','Urgente'),
(5,5,5,'2026-06-06','08:30:00','Normal'),
(6,6,6,'2026-06-06','09:30:00','Urgente'),
(7,7,7,'2026-06-06','10:30:00','Normal'),
(8,8,8,'2026-06-06','11:30:00','Normal'),
(9,9,9,'2026-06-07','08:00:00','Urgente'),
(10,10,10,'2026-06-07','09:00:00','Normal'),
(11,11,11,'2026-06-07','10:00:00','Urgente'),
(12,12,12,'2026-06-07','11:00:00','Normal'),
(13,13,13,'2026-06-08','08:00:00','Normal'),
(14,14,14,'2026-06-08','09:00:00','Urgente'),
(15,15,15,'2026-06-08','10:00:00','Normal');

-- =========================================
-- TABLA CONSULTA
-- =========================================

CREATE TABLE consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT,
    diagnostico TEXT,
    tratamiento TEXT,

    FOREIGN KEY(id_cita)
    REFERENCES cita(id_cita)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO consulta VALUES
(1,1,'Gripe común','Reposo e hidratación'),
(2,2,'Dolor abdominal','Dieta blanda'),
(3,3,'Migraña','Medicamento y descanso'),
(4,4,'Ansiedad','Terapia psicológica'),
(5,5,'Fractura leve','Reposo y yeso'),
(6,6,'Infección respiratoria','Antibióticos'),
(7,7,'Diabetes tipo 2','Control alimenticio'),
(8,8,'Hipertensión','Medicamento diario'),
(9,9,'Gastritis','Protector gástrico'),
(10,10,'Dolor muscular','Antiinflamatorios'),
(11,11,'Alergia','Antihistamínicos'),
(12,12,'Problemas visuales','Uso de lentes'),
(13,13,'Artritis','Terapia física'),
(14,14,'Infección viral','Reposo'),
(15,15,'Dolor lumbar','Ejercicios y terapia');

-- =========================================
-- TABLA MEDICAMENTO
-- =========================================

CREATE TABLE medicamento (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);

INSERT INTO medicamento VALUES
(1,'Paracetamol','Dolor y fiebre'),
(2,'Ibuprofeno','Antiinflamatorio'),
(3,'Amoxicilina','Antibiótico'),
(4,'Loratadina','Antialérgico'),
(5,'Omeprazol','Protector gástrico'),
(6,'Metformina','Control diabetes'),
(7,'Losartan','Presión arterial'),
(8,'Diclofenaco','Dolor muscular'),
(9,'Vitamina C','Suplemento'),
(10,'Azitromicina','Antibiótico respiratorio'),
(11,'Naproxeno','Dolor intenso'),
(12,'Insulina','Control glucosa'),
(13,'Cetirizina','Alergias'),
(14,'Prednisona','Inflamación'),
(15,'Clonazepam','Ansiedad');

-- =========================================
-- TABLA RECETA
-- =========================================

CREATE TABLE receta (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    id_consulta INT,
    fecha DATE,

    FOREIGN KEY(id_consulta)
    REFERENCES consulta(id_consulta)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO receta VALUES
(1,1,'2026-06-05'),
(2,2,'2026-06-05'),
(3,3,'2026-06-05'),
(4,4,'2026-06-05'),
(5,5,'2026-06-06'),
(6,6,'2026-06-06'),
(7,7,'2026-06-06'),
(8,8,'2026-06-06'),
(9,9,'2026-06-07'),
(10,10,'2026-06-07'),
(11,11,'2026-06-07'),
(12,12,'2026-06-07'),
(13,13,'2026-06-08'),
(14,14,'2026-06-08'),
(15,15,'2026-06-08');

-- =========================================
-- TABLA RECETA_MEDICAMENTO
-- =========================================

CREATE TABLE receta_medicamento (
    id_receta INT,
    id_medicamento INT,
    dosis VARCHAR(100),

    PRIMARY KEY(id_receta,id_medicamento),

    FOREIGN KEY(id_receta)
    REFERENCES receta(id_receta)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_medicamento)
    REFERENCES medicamento(id_medicamento)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO receta_medicamento VALUES
(1,1,'500mg cada 8 horas'),
(2,2,'1 tableta diaria'),
(3,3,'500mg cada 12 horas'),
(4,15,'0.5mg antes de dormir'),
(5,8,'550mg cada 8 horas'),
(6,10,'500mg cada 12 horas'),
(7,6,'850mg después del desayuno'),
(8,7,'50mg diarios'),
(9,5,'20mg antes del desayuno'),
(10,11,'1 cápsula cada 8 horas'),
(11,13,'1 tableta nocturna'),
(12,4,'10mg diarios'),
(13,14,'20mg diarios'),
(14,9,'1 cápsula diaria'),
(15,2,'1 tableta cada 12 horas');

-- =========================================
-- TABLA FACTURA
-- =========================================

CREATE TABLE factura (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    id_consulta INT,
    numero_factura VARCHAR(50),
    fecha_emision DATETIME,
    subtotal DECIMAL(10,2),
    impuestos DECIMAL(10,2),
    total DECIMAL(10,2),
    metodo_pago ENUM('Efectivo','Tarjeta','Transferencia','Pendiente'),
    estado ENUM('Pagada','Pendiente','Cancelada'),

    FOREIGN KEY(id_paciente)
    REFERENCES paciente(id_paciente)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

    FOREIGN KEY(id_consulta)
    REFERENCES consulta(id_consulta)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

INSERT INTO factura VALUES
(1,1,1,'FAC-001','2026-06-05 08:00:00',100,12,112,'Efectivo','Pagada'),
(2,2,2,'FAC-002','2026-06-05 09:00:00',120,14.4,134.4,'Tarjeta','Pagada'),
(3,3,3,'FAC-003','2026-06-05 10:00:00',150,18,168,'Transferencia','Pendiente'),
(4,4,4,'FAC-004','2026-06-05 11:00:00',110,13.2,123.2,'Efectivo','Pagada'),
(5,5,5,'FAC-005','2026-06-06 08:00:00',160,19.2,179.2,'Tarjeta','Pagada'),
(6,6,6,'FAC-006','2026-06-06 09:00:00',180,21.6,201.6,'Transferencia','Pendiente'),
(7,7,7,'FAC-007','2026-06-06 10:00:00',130,15.6,145.6,'Efectivo','Pagada'),
(8,8,8,'FAC-008','2026-06-06 11:00:00',170,20.4,190.4,'Tarjeta','Pagada'),
(9,9,9,'FAC-009','2026-06-07 08:00:00',190,22.8,212.8,'Transferencia','Pendiente'),
(10,10,10,'FAC-010','2026-06-07 09:00:00',200,24,224,'Efectivo','Pagada'),
(11,11,11,'FAC-011','2026-06-07 10:00:00',140,16.8,156.8,'Tarjeta','Pagada'),
(12,12,12,'FAC-012','2026-06-07 11:00:00',125,15,140,'Transferencia','Pendiente'),
(13,13,13,'FAC-013','2026-06-08 08:00:00',175,21,196,'Efectivo','Pagada'),
(14,14,14,'FAC-014','2026-06-08 09:00:00',165,19.8,184.8,'Tarjeta','Pagada'),
(15,15,15,'FAC-015','2026-06-08 10:00:00',155,18.6,173.6,'Transferencia','Pendiente');

-- =========================================
-- TABLA FACTURA_DETALLE
-- =========================================

CREATE TABLE factura_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT,
    descripcion VARCHAR(255),
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),

    FOREIGN KEY(id_factura)
    REFERENCES factura(id_factura)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO factura_detalle VALUES
(1,1,'Consulta médica',1,100,100),
(2,2,'Consulta médica',1,120,120),
(3,3,'Consulta médica',1,150,150),
(4,4,'Consulta médica',1,110,110),
(5,5,'Consulta médica',1,160,160),
(6,6,'Consulta médica',1,180,180),
(7,7,'Consulta médica',1,130,130),
(8,8,'Consulta médica',1,170,170),
(9,9,'Consulta médica',1,190,190),
(10,10,'Consulta médica',1,200,200),
(11,11,'Consulta médica',1,140,140),
(12,12,'Consulta médica',1,125,125),
(13,13,'Consulta médica',1,175,175),
(14,14,'Consulta médica',1,165,165),
(15,15,'Consulta médica',1,155,155);

-- =========================================
-- TABLA HISTORIAL_MEDICO
-- =========================================

CREATE TABLE historial_medico (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT,
    descripcion TEXT,
    fecha DATE,

    FOREIGN KEY(id_paciente)
    REFERENCES paciente(id_paciente)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO historial_medico VALUES
(1,1,'Historial de gripe común','2026-01-10'),
(2,2,'Dolores abdominales frecuentes','2026-01-11'),
(3,3,'Migrañas constantes','2026-01-12'),
(4,4,'Ansiedad moderada','2026-01-13'),
(5,5,'Fractura de brazo','2026-01-14'),
(6,6,'Problemas respiratorios','2026-01-15'),
(7,7,'Control de diabetes','2026-01-16'),
(8,8,'Hipertensión arterial','2026-01-17'),
(9,9,'Problemas gástricos','2026-01-18'),
(10,10,'Dolor muscular frecuente','2026-01-19'),
(11,11,'Alergias estacionales','2026-01-20'),
(12,12,'Problemas de visión','2026-01-21'),
(13,13,'Artritis leve','2026-01-22'),
(14,14,'Infección viral reciente','2026-01-23'),
(15,15,'Dolor lumbar recurrente','2026-01-24');

-- =========================================
-- TABLA PAGO
-- =========================================

CREATE TABLE pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT,
    fecha DATE,
    monto DECIMAL(10,2),
    metodo VARCHAR(50),

    FOREIGN KEY(id_factura)
    REFERENCES factura(id_factura)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

INSERT INTO pago VALUES
(1,1,'2026-06-05',112,'Efectivo'),
(2,2,'2026-06-05',134.4,'Tarjeta'),
(3,3,'2026-06-05',168,'Transferencia'),
(4,4,'2026-06-05',123.2,'Efectivo'),
(5,5,'2026-06-06',179.2,'Tarjeta'),
(6,6,'2026-06-06',201.6,'Transferencia'),
(7,7,'2026-06-06',145.6,'Efectivo'),
(8,8,'2026-06-06',190.4,'Tarjeta'),
(9,9,'2026-06-07',212.8,'Transferencia'),
(10,10,'2026-06-07',224,'Efectivo'),
(11,11,'2026-06-07',156.8,'Tarjeta'),
(12,12,'2026-06-07',140,'Transferencia'),
(13,13,'2026-06-08',196,'Efectivo'),
(14,14,'2026-06-08',184.8,'Tarjeta'),
(15,15,'2026-06-08',173.6,'Transferencia');