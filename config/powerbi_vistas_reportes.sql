-- Capa de lectura para Power BI.
-- Es idempotente: puede ejecutarse nuevamente cuando se ajusten las vistas.
-- No expone datos de acceso, notas clinicas, diagnosticos, tratamientos,
-- telefonos ni direcciones de pacientes.

CREATE DATABASE IF NOT EXISTS clinica_reportes
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_medicos AS
SELECT
    m.id_medico,
    CONCAT(m.nombre, ' ', m.apellido) AS medico,
    GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades
FROM clinica_medica.medico m
LEFT JOIN clinica_medica.medico_especialidad me
    ON me.id_medico = m.id_medico
LEFT JOIN clinica_medica.especialidad e
    ON e.id_especialidad = me.id_especialidad
GROUP BY m.id_medico, m.nombre, m.apellido;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_pacientes_segmentos AS
SELECT
    p.id_paciente,
    CONCAT('PAC-', LPAD(p.id_paciente, 6, '0')) AS codigo_paciente,
    YEAR(p.fecha_nacimiento) AS anio_nacimiento,
    TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) AS edad,
    CASE
        WHEN TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) < 18 THEN 'Menor de 18'
        WHEN TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) BETWEEN 18 AND 29 THEN '18-29'
        WHEN TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) BETWEEN 30 AND 44 THEN '30-44'
        WHEN TIMESTAMPDIFF(YEAR, p.fecha_nacimiento, CURDATE()) BETWEEN 45 AND 59 THEN '45-59'
        ELSE '60 o mas'
    END AS rango_edad
FROM clinica_medica.paciente p;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_citas AS
SELECT
    c.id_cita,
    c.fecha,
    c.hora,
    c.estado,
    c.id_paciente,
    CONCAT('PAC-', LPAD(c.id_paciente, 6, '0')) AS codigo_paciente,
    c.id_medico,
    CONCAT(m.nombre, ' ', m.apellido) AS medico,
    GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS especialidades,
    CASE WHEN con.id_consulta IS NULL THEN 0 ELSE 1 END AS tuvo_consulta
FROM clinica_medica.cita c
JOIN clinica_medica.medico m
    ON m.id_medico = c.id_medico
LEFT JOIN clinica_medica.medico_especialidad me
    ON me.id_medico = m.id_medico
LEFT JOIN clinica_medica.especialidad e
    ON e.id_especialidad = me.id_especialidad
LEFT JOIN clinica_medica.consulta con
    ON con.id_cita = c.id_cita
GROUP BY
    c.id_cita, c.fecha, c.hora, c.estado, c.id_paciente,
    c.id_medico, m.nombre, m.apellido, con.id_consulta;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_facturas AS
SELECT
    f.id_factura,
    f.numero_factura,
    f.fecha_emision,
    DATE(f.fecha_emision) AS fecha,
    f.id_paciente,
    CONCAT('PAC-', LPAD(f.id_paciente, 6, '0')) AS codigo_paciente,
    c.id_medico,
    CONCAT(m.nombre, ' ', m.apellido) AS medico,
    f.subtotal,
    f.impuestos,
    f.total,
    f.metodo_pago,
    f.estado
FROM clinica_medica.factura f
LEFT JOIN clinica_medica.consulta con
    ON con.id_consulta = f.id_consulta
LEFT JOIN clinica_medica.cita c
    ON c.id_cita = con.id_cita
LEFT JOIN clinica_medica.medico m
    ON m.id_medico = c.id_medico;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_pagos AS
SELECT
    p.id_pago,
    p.id_factura,
    f.numero_factura,
    p.fecha,
    p.monto,
    p.metodo,
    f.estado AS estado_factura
FROM clinica_medica.pago p
JOIN clinica_medica.factura f
    ON f.id_factura = p.id_factura;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_factura_detalle AS
SELECT
    fd.id_detalle,
    fd.id_factura,
    f.numero_factura,
    DATE(f.fecha_emision) AS fecha,
    fd.id_medicamento,
    COALESCE(m.nombre, fd.descripcion) AS concepto,
    fd.cantidad,
    fd.precio_unitario,
    fd.subtotal
FROM clinica_medica.factura_detalle fd
JOIN clinica_medica.factura f
    ON f.id_factura = fd.id_factura
LEFT JOIN clinica_medica.medicamento m
    ON m.id_medicamento = fd.id_medicamento;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_medicamentos AS
SELECT
    m.id_medicamento,
    m.nombre AS medicamento,
    m.stock,
    m.precio,
    COUNT(rm.id_receta) AS veces_recetado
FROM clinica_medica.medicamento m
LEFT JOIN clinica_medica.receta_medicamento rm
    ON rm.id_medicamento = m.id_medicamento
GROUP BY m.id_medicamento, m.nombre, m.stock, m.precio;

CREATE OR REPLACE SQL SECURITY DEFINER VIEW clinica_reportes.vw_recetas_medicamentos AS
SELECT
    r.id_receta,
    r.fecha,
    rm.id_medicamento,
    m.nombre AS medicamento
FROM clinica_medica.receta r
JOIN clinica_medica.receta_medicamento rm
    ON rm.id_receta = r.id_receta
JOIN clinica_medica.medicamento m
    ON m.id_medicamento = rm.id_medicamento;

