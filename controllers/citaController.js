const db = require('../config/db');
const ESTADOS_VALIDOS = ['Normal', 'Urgente', 'Cancelada', 'Completada'];

const obtenerFechaLocal = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const validarFechaYHora = (fecha, hora) => {
    const horaNormalizada = hora?.slice(0, 5);
    const fechaActual = obtenerFechaLocal();
    const horaActual = new Date().toTimeString().slice(0, 5);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < fechaActual) {
        return 'No puedes agendar una cita en una fecha anterior a hoy';
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(horaNormalizada || '') ||
        horaNormalizada < '08:00' || horaNormalizada > '17:00') {
        return 'La hora debe ser entre 08:00 y 17:00';
    }
    if (fecha === fechaActual && horaNormalizada < horaActual) {
        return 'No puedes agendar una cita a una hora que ya pasó hoy';
    }
    return null;
};

const validarCita = ({ id_paciente, id_medico, fecha, hora, estado }) => {
    if (!Number.isInteger(Number(id_paciente)) || Number(id_paciente) <= 0 ||
        !Number.isInteger(Number(id_medico)) || Number(id_medico) <= 0 ||
        !fecha || !hora || !estado) return 'Todos los campos son obligatorios';
    if (!ESTADOS_VALIDOS.includes(estado)) return 'El estado de la cita no es válido';
    return validarFechaYHora(fecha, hora);
};

const responderErrorCita = (res, err, fallback) => {
    if (err?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El médico o paciente ya tiene una cita en esa fecha y hora' });
    }
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'El paciente o médico seleccionado no existe' });
    }
    return res.status(500).json({ message: fallback });
};

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

    const validationError = validarCita({ id_paciente, id_medico, fecha, hora, estado });
    if (validationError) return res.status(400).json({ message: validationError });

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
                    return responderErrorCita(res, err, 'Error al crear cita');
                }
                res.status(201).json({ message: 'Cita creada exitosamente', id: result.insertId });
            });
        });
    });
};

exports.actualizarCita = (req, res) => {
    const { id } = req.params;
    const { id_paciente, id_medico, fecha, hora, estado } = req.body;

    const validationError = validarCita({ id_paciente, id_medico, fecha, hora, estado });
    if (validationError) return res.status(400).json({ message: validationError });

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
                    return responderErrorCita(res, err, 'Error al actualizar cita');
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
    db.query('SELECT COUNT(*) AS total FROM consulta WHERE id_cita = ?', [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar cita' });
        }
        if (Number(rows[0].total) > 0) {
            return res.status(409).json({ message: 'No se puede eliminar una cita con consulta clínica asociada' });
        }
        db.query('DELETE FROM cita WHERE id_cita = ?', [id], (deleteErr, result) => {
            if (deleteErr) return res.status(500).json({ message: 'Error al eliminar cita' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Cita no encontrada' });
            res.json({ message: 'Cita eliminada exitosamente' });
        });
    });
};  
