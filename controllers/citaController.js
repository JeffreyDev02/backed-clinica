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
    const { id_paciente, id_medico, fecha, hora, estado } = req.body;
    const sql = 'INSERT INTO cita (id_paciente, id_medico, fecha, hora, estado) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [id_paciente, id_medico, fecha, hora, estado], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al crear cita' });
        }
        res.json({ message: 'Cita creada exitosamente', id: result.insertId });
    });
};

exports.actualizarCita = (req, res) => {
    const { id } = req.params;
    const { id_paciente, id_medico, fecha, hora, estado } = req.body;
    const sql = 'UPDATE cita SET id_paciente =  ?, id_medico = ?, fecha = ?, hora = ?, estado = ? WHERE id_cita = ?';
    db.query(sql, [id_paciente, id_medico, fecha, hora, estado, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar cita' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.json({ message: 'Cita actualizada exitosamente' });
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