const db = require('../config/db');

// Expediente completo de un paciente
exports.obtenerExpediente = (req, res) => {
    const { id } = req.params;

    // 1. Datos del paciente
    const sqlPaciente = `SELECT * FROM paciente WHERE id_paciente = ?`;

    // 2. Historial médico
    const sqlHistorial = `
        SELECT * FROM historial_medico
        WHERE id_paciente = ?
        ORDER BY fecha DESC
    `;

    // 3. Citas con médico
    const sqlCitas = `
        SELECT c.id_cita, c.fecha, c.hora, c.estado,
               CONCAT(m.nombre, ' ', m.apellido) AS medico,
               (SELECT e.nombre FROM medico_especialidad me
                JOIN especialidad e ON me.id_especialidad = e.id_especialidad
                WHERE me.id_medico = m.id_medico LIMIT 1) AS especialidad
        FROM cita c
        JOIN medico m ON c.id_medico = m.id_medico
        WHERE c.id_paciente = ?
        ORDER BY c.fecha DESC, c.hora DESC
    `;

    // 4. Consultas con diagnóstico y tratamiento
    const sqlConsultas = `
        SELECT co.id_consulta, co.diagnostico, co.tratamiento,
               c.fecha, c.hora, c.estado,
               CONCAT(m.nombre, ' ', m.apellido) AS medico,
               (SELECT e.nombre FROM medico_especialidad me
                JOIN especialidad e ON me.id_especialidad = e.id_especialidad
                WHERE me.id_medico = m.id_medico LIMIT 1) AS especialidad
        FROM consulta co
        JOIN cita c ON co.id_cita = c.id_cita
        JOIN medico m ON c.id_medico = m.id_medico
        WHERE c.id_paciente = ?
        ORDER BY c.fecha DESC
    `;

    // 5. Medicamentos recetados (a través de receta -> receta_medicamento -> medicamento)
    const sqlMedicamentos = `
        SELECT rm.dosis,
               med.nombre AS medicamento, med.descripcion,
               r.fecha AS fecha_receta,
               co.diagnostico,
               CONCAT(m.nombre, ' ', m.apellido) AS medico
        FROM receta r
        JOIN consulta co ON r.id_consulta = co.id_consulta
        JOIN cita c ON co.id_cita = c.id_cita
        JOIN receta_medicamento rm ON r.id_receta = rm.id_receta
        JOIN medicamento med ON rm.id_medicamento = med.id_medicamento
        JOIN medico m ON c.id_medico = m.id_medico
        WHERE c.id_paciente = ?
        ORDER BY r.fecha DESC
    `;

    db.query(sqlPaciente, [id], (err, pacienteResult) => {
        if (err) return res.status(500).json({ message: 'Error al obtener paciente', error: err });
        if (pacienteResult.length === 0) return res.status(404).json({ message: 'Paciente no encontrado' });

        const paciente = pacienteResult[0];

        db.query(sqlHistorial, [id], (err2, historial) => {
            if (err2) return res.status(500).json({ message: 'Error al obtener historial', error: err2 });

            db.query(sqlCitas, [id], (err3, citas) => {
                if (err3) return res.status(500).json({ message: 'Error al obtener citas', error: err3 });

                db.query(sqlConsultas, [id], (err4, consultas) => {
                    if (err4) return res.status(500).json({ message: 'Error al obtener consultas', error: err4 });

                    db.query(sqlMedicamentos, [id], (err5, medicamentos) => {
                        if (err5) return res.status(500).json({ message: 'Error al obtener medicamentos', error: err5 });

                        res.json({ paciente, historial, citas, consultas, medicamentos });
                    });
                });
            });
        });
    });
};

// Agregar nota al historial médico
exports.agregarHistorial = (req, res) => {
    const { id } = req.params;
    const { descripcion } = req.body;

    if (!descripcion || !descripcion.trim() || descripcion.trim().length > 5000)
        return res.status(400).json({ message: 'La descripción es requerida' });

    const query = `INSERT INTO historial_medico (id_paciente, descripcion, fecha) VALUES (?, ?, CURDATE())`;
    db.query(query, [id, descripcion.trim()], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al agregar historial', error: err });
        res.status(201).json({ message: 'Nota agregada', id: result.insertId });
    });
};
