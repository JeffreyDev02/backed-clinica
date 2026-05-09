const db = require('../config/db');

// Estadísticas del dashboard principal (Home)
exports.homeStats = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM cita WHERE fecha = CURDATE()) AS citas_hoy,
            (SELECT COUNT(*) FROM paciente)                      AS total_pacientes,
            (SELECT COUNT(*) FROM medico)                        AS total_medicos,
            (SELECT COUNT(*) FROM cita WHERE estado NOT IN ('Cancelada','Completada')) AS citas_activas
    `;
    const sqlProximas = `
        SELECT c.id_cita, c.fecha, c.hora, c.estado,
               CONCAT(p.nombre, ' ', p.apellido) AS paciente,
               CONCAT(m.nombre, ' ', m.apellido) AS medico,
               (SELECT e.nombre FROM medico_especialidad me
                JOIN especialidad e ON me.id_especialidad = e.id_especialidad
                WHERE me.id_medico = m.id_medico LIMIT 1) AS especialidad
        FROM cita c
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN medico   m ON c.id_medico   = m.id_medico
        WHERE c.fecha >= CURDATE() AND c.estado NOT IN ('Cancelada','Completada')
        ORDER BY c.fecha ASC, c.hora ASC
        LIMIT 5
    `;
    db.query(sql, (err, stats) => {
        if (err) return res.status(500).json({ message: 'Error al obtener estadísticas', error: err });
        db.query(sqlProximas, (err2, proximas) => {
            if (err2) return res.status(500).json({ message: 'Error al obtener próximas citas', error: err2 });
            res.json({ ...stats[0], proximas_citas: proximas });
        });
    });
};

// Resumen general: totales de cada entidad
exports.obtenerResumen = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM paciente) AS total_pacientes,
            (SELECT COUNT(*) FROM medico)   AS total_medicos,
            (SELECT COUNT(*) FROM cita)     AS total_citas,
            (SELECT COUNT(*) FROM consulta) AS total_consultas
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener resumen', error: err });
        res.json(result[0]);
    });
};

// Citas agrupadas por estado
exports.citasPorEstado = (req, res) => {
    const sql = `
        SELECT estado, COUNT(*) AS total
        FROM cita
        GROUP BY estado
        ORDER BY total DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener citas por estado', error: err });
        res.json(result);
    });
};

// Citas agrupadas por médico
exports.citasPorMedico = (req, res) => {
    const sql = `
        SELECT 
            m.id_medico,
            CONCAT(m.nombre, ' ', m.apellido) AS medico,
            COUNT(c.id_cita) AS total_citas
        FROM medico m
        LEFT JOIN cita c ON m.id_medico = c.id_medico
        GROUP BY m.id_medico, m.nombre, m.apellido
        ORDER BY total_citas DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener citas por médico', error: err });
        res.json(result);
    });
};

// Top 5 medicamentos más recetados
exports.medicamentosTop = (req, res) => {
    const sql = `
        SELECT 
            med.nombre,
            COUNT(rm.id_medicamento) AS total_recetas
        FROM medicamento med
        LEFT JOIN receta_medicamento rm ON med.id_medicamento = rm.id_medicamento
        GROUP BY med.id_medicamento, med.nombre
        ORDER BY total_recetas DESC
        LIMIT 5
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener medicamentos top', error: err });
        res.json(result);
    });
};

// Pacientes atendidos en rango de fechas
exports.pacientesAtendidos = (req, res) => {
    const { desde, hasta } = req.query;
    const d = desde || '2000-01-01';
    const h = hasta  || new Date().toISOString().slice(0, 10);
    const sql = `
        SELECT p.id_paciente, CONCAT(p.nombre, ' ', p.apellido) AS paciente,
               p.telefono, p.direccion, COUNT(c.id_cita) AS total_citas
        FROM paciente p
        JOIN cita c ON p.id_paciente = c.id_paciente
        WHERE c.fecha BETWEEN ? AND ?
        GROUP BY p.id_paciente
        ORDER BY total_citas DESC
    `;
    db.query(sql, [d, h], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener pacientes atendidos', error: err });
        res.json(result);
    });
};

// Todos los medicamentos con conteo de recetas
exports.medicamentosReporte = (req, res) => {
    const sql = `
        SELECT m.id_medicamento, m.nombre, m.descripcion,
               COUNT(rm.id_medicamento) AS veces_recetado
        FROM medicamento m
        LEFT JOIN receta_medicamento rm ON m.id_medicamento = rm.id_medicamento
        GROUP BY m.id_medicamento
        ORDER BY veces_recetado DESC
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener reporte de medicamentos', error: err });
        res.json(result);
    });
};

// Actividad de médicos en rango de fechas
exports.doctoresReporte = (req, res) => {
    const { desde, hasta } = req.query;
    const d = desde || '2000-01-01';
    const h = hasta  || new Date().toISOString().slice(0, 10);
    const sql = `
        SELECT me.id_medico, CONCAT(me.nombre, ' ', me.apellido) AS medico, me.telefono,
               COUNT(DISTINCT c.id_cita)        AS total_citas,
               COUNT(DISTINCT con.id_consulta)  AS total_consultas
        FROM medico me
        LEFT JOIN cita c       ON me.id_medico = c.id_medico AND c.fecha BETWEEN ? AND ?
        LEFT JOIN consulta con ON c.id_cita     = con.id_cita
        GROUP BY me.id_medico
        ORDER BY total_citas DESC
    `;
    db.query(sql, [d, h], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener reporte de médicos', error: err });
        res.json(result);
    });
};

// Citas en rango de fechas con nombre de paciente y médico
exports.citasReporte = (req, res) => {
    const { desde, hasta } = req.query;
    const d = desde || '2000-01-01';
    const h = hasta  || new Date().toISOString().slice(0, 10);
    const sql = `
        SELECT c.id_cita, c.fecha, c.hora, c.estado,
               CONCAT(p.nombre, ' ', p.apellido)  AS paciente,
               CONCAT(me.nombre, ' ', me.apellido) AS medico
        FROM cita c
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN medico  me ON c.id_medico   = me.id_medico
        WHERE c.fecha BETWEEN ? AND ?
        ORDER BY c.fecha DESC, c.hora DESC
    `;
    db.query(sql, [d, h], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener reporte de citas', error: err });
        res.json(result);
    });
};

// Top 5 pacientes más frecuentes
exports.pacienteFrecuente = (req, res) => {
    const sql = `
        SELECT p.id_paciente, CONCAT(p.nombre, ' ', p.apellido) AS paciente,
               p.telefono, COUNT(c.id_cita) AS total_visitas
        FROM paciente p
        JOIN cita c ON p.id_paciente = c.id_paciente
        GROUP BY p.id_paciente
        ORDER BY total_visitas DESC
        LIMIT 5
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener paciente frecuente', error: err });
        res.json(result);
    });
};

// Top 5 médicos con más trabajo
exports.doctorMasTrabajo = (req, res) => {
    const sql = `
        SELECT me.id_medico, CONCAT(me.nombre, ' ', me.apellido) AS medico,
               me.telefono,
               COUNT(DISTINCT c.id_cita)        AS total_citas,
               COUNT(DISTINCT con.id_consulta)  AS total_consultas
        FROM medico me
        LEFT JOIN cita c       ON me.id_medico = c.id_medico
        LEFT JOIN consulta con ON c.id_cita    = con.id_cita
        GROUP BY me.id_medico
        ORDER BY total_citas DESC
        LIMIT 5
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener doctor con más trabajo', error: err });
        res.json(result);
    });
};

// Últimas 10 consultas con datos del paciente y médico
exports.consultasRecientes = (req, res) => {
    const sql = `
        SELECT 
            con.id_consulta,
            c.fecha,
            c.hora,
            c.estado,
            CONCAT(p.nombre, ' ', p.apellido) AS paciente,
            CONCAT(m.nombre, ' ', m.apellido) AS medico,
            con.diagnostico,
            con.tratamiento
        FROM consulta con
        JOIN cita c   ON con.id_cita      = c.id_cita
        JOIN paciente p ON c.id_paciente  = p.id_paciente
        JOIN medico m   ON c.id_medico    = m.id_medico
        ORDER BY c.fecha DESC, c.hora DESC
        LIMIT 10
    `;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener consultas recientes', error: err });
        res.json(result);
    });
};
