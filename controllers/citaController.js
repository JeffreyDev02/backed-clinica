const db = require('../config/db');

exports.obtenerCitas = (req, res) => {
    const sql = 'SELECT * FROM cita';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener citas' });
        }
        res.json(result);
    });
};

exports.obtenerCitaPorId = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM cita WHERE id_cita = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener cita' });
        }
        res.json(result[0]);
    });
};

exports.crearCita = (req, res) => {
    const { id_paciente, id_medico, fecha, hora, estado } = req.body || {};

    if (!id_paciente || !id_medico || !fecha || !hora || !estado) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validar que no exista conflicto con el médico (misma fecha y hora)
    const sqlCheckMedico = 'SELECT * FROM cita WHERE id_medico = ? AND fecha = ? AND hora = ?';
    db.query(sqlCheckMedico, [id_medico, fecha, hora], (err, resultMedico) => {
        if (err) {
            return res.status(500).json({ message: 'Error al validar disponibilidad del médico' });
        }

        if (resultMedico.length > 0) {
            return res.status(409).json({ 
                message: 'El médico ya tiene una cita agendada en esa fecha y hora',
                conflict: 'medico'
            });
        }

        // Validar que no exista conflicto con el paciente (misma fecha y hora)
        const sqlCheckPaciente = 'SELECT * FROM cita WHERE id_paciente = ? AND fecha = ? AND hora = ?';
        db.query(sqlCheckPaciente, [id_paciente, fecha, hora], (err, resultPaciente) => {
            if (err) {
                return res.status(500).json({ message: 'Error al validar disponibilidad del paciente' });
            }

            if (resultPaciente.length > 0) {
                return res.status(409).json({ 
                    message: 'El paciente ya tiene una cita agendada en esa fecha y hora',
                    conflict: 'paciente'
                });
            }

            // Si no hay conflictos, crear la cita
            const sql = 'INSERT INTO cita (id_paciente, id_medico, fecha, hora, estado) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [id_paciente, id_medico, fecha, hora, estado], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al crear cita' });
                }
                res.status(201).json({ message: 'Cita creada exitosamente', id: result.insertId });
            });
        });
    });
};

exports.actualizarCita = (req, res) => {
    const { id } = req.params;
    const { id_paciente, id_medico, fecha, hora, estado } = req.body;

    if (!id_paciente || !id_medico || !fecha || !hora || !estado) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validar que no exista conflicto con el médico (misma fecha y hora, pero excluyendo esta cita)
    const sqlCheckMedico = 'SELECT * FROM cita WHERE id_medico = ? AND fecha = ? AND hora = ? AND id_cita != ?';
    db.query(sqlCheckMedico, [id_medico, fecha, hora, id], (err, resultMedico) => {
        if (err) {
            return res.status(500).json({ message: 'Error al validar disponibilidad del médico' });
        }

        if (resultMedico.length > 0) {
            return res.status(409).json({ 
                message: 'El médico ya tiene una cita agendada en esa fecha y hora',
                conflict: 'medico'
            });
        }

        // Validar que no exista conflicto con el paciente (misma fecha y hora, pero excluyendo esta cita)
        const sqlCheckPaciente = 'SELECT * FROM cita WHERE id_paciente = ? AND fecha = ? AND hora = ? AND id_cita != ?';
        db.query(sqlCheckPaciente, [id_paciente, fecha, hora, id], (err, resultPaciente) => {
            if (err) {
                return res.status(500).json({ message: 'Error al validar disponibilidad del paciente' });
            }

            if (resultPaciente.length > 0) {
                return res.status(409).json({ 
                    message: 'El paciente ya tiene una cita agendada en esa fecha y hora',
                    conflict: 'paciente'
                });
            }

            // Si no hay conflictos, actualizar la cita
            const sql = 'UPDATE cita SET id_paciente = ?, id_medico = ?, fecha = ?, hora = ?, estado = ? WHERE id_cita = ?';
            db.query(sql, [id_paciente, id_medico, fecha, hora, estado, id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al actualizar cita' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Cita no encontrada' });
                }
                res.json({ message: 'Cita actualizada exitosamente' });
            });
        });
    });
};

exports.eliminarCita = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM cita WHERE id_cita = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar cita' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.json({ message: 'Cita eliminada exitosamente' });
    });
};  