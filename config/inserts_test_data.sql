-- ============================================================
-- DATOS DE PRUEBA — MediConnect
-- Ejecutar en la base de datos clinica_medica
-- Continúa desde los IDs existentes (según AUTO_INCREMENT del DDL)
-- ============================================================

-- ── Médicos adicionales (continúa desde ID 5) ───────────────
INSERT INTO medico (id_medico, nombre, apellido, telefono) VALUES
(5, 'Elena',   'Vargas',   '5555-0505'),
(6, 'Roberto', 'Jiménez',  '5555-0606'),
(7, 'Carmen',  'Salazar',  '5555-0707');

-- ── Pacientes adicionales (continúa desde ID 7) ─────────────
INSERT INTO paciente (id_paciente, nombre, apellido, fecha_nacimiento, telefono, direccion) VALUES
(7,  'Luis',    'Castillo', '1990-03-15', '5555-1001', 'Calle 7, Zona 1'),
(8,  'Ana',     'Mendoza',  '1985-07-22', '5555-1002', 'Av. Principal 89'),
(9,  'Pedro',   'Torres',   '1978-11-08', '5555-1003', 'Colonia Las Flores'),
(10, 'María',   'Reyes',    '1995-01-30', '5555-1004', 'Barrio San Juan'),
(11, 'Carlos',  'Soto',     '1982-06-14', '5555-1005', 'Calle Real 45'),
(12, 'Lucía',   'Morales',  '1999-09-05', '5555-1006', 'Av. Reforma 12'),
(13, 'Diego',   'Herrera',  '1970-04-25', '5555-1007', 'Zona Central'),
(14, 'Rosa',    'Fuentes',  '1988-12-10', '5555-1008', 'Col. Nueva Vista');

-- ── Especialidades médico (nuevos médicos) ──────────────────
INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6),
(4, 7),
(5, 8), (5, 9),
(6, 1), (6, 10),
(7, 2), (7, 3);

-- ── Citas adicionales (continúa desde ID 7) ─────────────────
-- Distribuidas entre enero y mayo 2026 para reportes con filtro de fecha
INSERT INTO cita (id_cita, id_paciente, id_medico, fecha, hora, estado) VALUES
(7,  1,  1, '2026-01-05', '08:00:00', 'Completada'),
(8,  2,  2, '2026-01-07', '09:30:00', 'Completada'),
(9,  3,  1, '2026-01-10', '10:00:00', 'Completada'),
(10, 4,  3, '2026-01-15', '11:00:00', 'Completada'),
(11, 5,  2, '2026-01-20', '08:30:00', 'Completada'),
(12, 6,  4, '2026-01-22', '14:00:00', 'Cancelada'),
(13, 1,  1, '2026-02-03', '09:00:00', 'Completada'),
(14, 7,  3, '2026-02-08', '10:30:00', 'Completada'),
(15, 8,  1, '2026-02-10', '08:00:00', 'Completada'),
(16, 2,  2, '2026-02-14', '11:30:00', 'Normal'),
(17, 9,  4, '2026-02-18', '15:00:00', 'Completada'),
(18, 10, 1, '2026-02-20', '09:30:00', 'Urgente'),
(19, 1,  2, '2026-03-01', '08:00:00', 'Completada'),
(20, 3,  3, '2026-03-05', '10:00:00', 'Completada'),
(21, 11, 1, '2026-03-08', '09:00:00', 'Normal'),
(22, 12, 4, '2026-03-12', '11:00:00', 'Completada'),
(23, 5,  2, '2026-03-15', '14:30:00', 'Completada'),
(24, 6,  1, '2026-03-20', '08:30:00', 'Urgente'),
(25, 13, 3, '2026-04-02', '10:00:00', 'Completada'),
(26, 1,  1, '2026-04-07', '09:00:00', 'Completada'),
(27, 2,  4, '2026-04-10', '11:30:00', 'Normal'),
(28, 14, 2, '2026-04-14', '08:00:00', 'Completada'),
(29, 4,  1, '2026-04-18', '10:30:00', 'Completada'),
(30, 8,  3, '2026-04-22', '09:00:00', 'Cancelada'),
(31, 1,  1, '2026-04-25', '08:00:00', 'Normal'),
(32, 3,  2, '2026-04-28', '11:00:00', 'Completada'),
(33, 7,  1, '2026-05-01', '09:30:00', 'Normal'),
(34, 10, 4, '2026-05-01', '10:00:00', 'Normal');

-- ── Consultas adicionales (continúa desde ID 3) ─────────────
INSERT INTO consulta (id_consulta, id_cita, diagnostico, tratamiento) VALUES
(3,  7,  'Hipertensión arterial leve',        'Medicación antihipertensiva, dieta baja en sodio'),
(4,  8,  'Gripe estacional',                  'Reposo, antitérmicos, hidratación'),
(5,  9,  'Diabetes tipo 2 (seguimiento)',      'Ajuste de dosis de insulina'),
(6,  10, 'Lumbalgia crónica',                 'Fisioterapia, antiinflamatorios'),
(7,  11, 'Infección urinaria',                'Antibióticos por 7 días'),
(8,  13, 'Migraña recurrente',                'Analgésicos, evitar exposición a luz fuerte'),
(9,  14, 'Gastritis aguda',                   'Omeprazol 20mg, dieta blanda'),
(10, 15, 'Anemia ferropénica',                'Suplemento de hierro, dieta rica en proteínas'),
(11, 19, 'Control de hipertensión',           'Continuar con medicación actual'),
(12, 20, 'Esguince de tobillo grado II',      'Reposo, hielo, vendaje compresivo'),
(13, 22, 'Dermatitis alérgica',               'Crema corticoide, antihistamínico oral'),
(14, 23, 'Bronquitis aguda',                  'Antibiótico, broncodilatador'),
(15, 25, 'Hipotiroidismo',                    'Levotiroxina 50mcg diaria en ayunas'),
(16, 26, 'Hipertensión arterial (control)',   'Ajuste de antihipertensivo'),
(17, 28, 'Artritis reumatoide',               'Metotrexato 7.5mg semanal'),
(18, 29, 'Artrosis de rodilla',               'Condroitín, fisioterapia, paracetamol');

-- ── Recetas adicionales (continúa desde ID 3) ───────────────
INSERT INTO receta (id_receta, id_consulta, fecha) VALUES
(3,  3,  '2026-01-05'),
(4,  4,  '2026-01-07'),
(5,  5,  '2026-01-10'),
(6,  6,  '2026-01-15'),
(7,  7,  '2026-01-20'),
(8,  8,  '2026-02-03'),
(9,  9,  '2026-02-08'),
(10, 10, '2026-02-10'),
(11, 11, '2026-03-01'),
(12, 13, '2026-03-12'),
(13, 14, '2026-03-15'),
(14, 16, '2026-04-07'),
(15, 17, '2026-04-14'),
(16, 18, '2026-04-18');

-- ── Receta-Medicamento (usa IDs 1-13 ya existentes) ─────────
INSERT INTO receta_medicamento (id_receta, id_medicamento, dosis) VALUES
(3,  1,  '1 tableta cada 12 horas por 30 días'),
(3,  2,  '1 tableta diaria en la mañana'),
(4,  3,  '500mg cada 8 horas por 5 días'),
(4,  4,  '2 cápsulas cada 6 horas'),
(5,  5,  '10 unidades subcutáneas en ayunas'),
(6,  6,  '1 tableta cada 8 horas por 10 días'),
(6,  7,  '1 ampolla intramuscular diaria por 3 días'),
(7,  8,  '1 tableta cada 8 horas por 7 días'),
(8,  1,  '50mg al inicio del dolor, máximo 2 por día'),
(9,  2,  '20mg antes de cada comida'),
(10, 9,  '300mg diarios con alimentos'),
(11, 3,  '500mg cada 12 horas por 10 días'),
(12, 10, '1 tableta diaria'),
(13, 11, '10mg cada 12 horas'),
(14, 1,  '1 tableta cada 12 horas'),
(15, 12, '7.5mg una vez por semana'),
(16, 13, '1 gramo cada 8 horas');

-- ── Historial médico ─────────────────────────────────────────
INSERT INTO historial_medico (id_paciente, descripcion, fecha) VALUES
(1,  'Paciente con hipertensión arterial diagnosticada en 2020. Medicado.',       '2026-01-05'),
(1,  'Control de presión arterial. Valores dentro del rango esperado.',            '2026-02-03'),
(1,  'Seguimiento mensual de hipertensión. Sin cambios.',                          '2026-03-01'),
(1,  'Presión estabilizada. Se mantiene medicación.',                              '2026-04-07'),
(2,  'Gripe con fiebre de 38.5°C. Tratamiento ambulatorio.',                      '2026-01-07'),
(3,  'Paciente diabético tipo 2 en seguimiento semestral.',                        '2026-01-10'),
(3,  'Esguince de tobillo izquierdo. Reposo 2 semanas.',                          '2026-03-05'),
(4,  'Lumbalgia crónica por trabajo sedentario. Fisioterapia recomendada.',        '2026-01-15'),
(5,  'Infección urinaria recurrente. Cultivo y antibiograma solicitados.',         '2026-01-20'),
(6,  'Urgente. Dolor abdominal agudo. Derivado a urgencias.',                      '2026-03-20'),
(7,  'Primera consulta. Gastritis diagnosticada. Dieta recomendada.',              '2026-02-08'),
(8,  'Anemia ferropénica moderada. Suplementación indicada.',                      '2026-02-10'),
(10, 'Tensión elevada, se inicia tratamiento.',                                    '2026-02-20');
