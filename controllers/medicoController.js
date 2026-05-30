const db = require('../config/db');
const { validateDoctor } = require('../utils/entityValidation');

exports.obtenerMedicos = (req, res) => {
    const sql = 'SELECT * FROM medico';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener medicos' });
        }
        res.json(result);
    });
};

exports.obtenerMedicoPorId = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM medico WHERE id_medico = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener medico' });
        }
        res.json(result[0]);
    });
};

exports.crearMedico = (req, res) => {
    const { nombre, apellido, telefono } = req.body || {};

    const validationError = validateDoctor({ nombre, apellido, telefono });
    if (validationError) return res.status(400).json({ message: validationError });

    const sql = 'INSERT INTO medico (nombre, apellido, telefono) VALUES (?, ?, ?)';
    db.query(sql, [nombre.trim(), apellido.trim(), telefono], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al crear medico' });
        }
        res.json({ message: 'Medico creado exitosamente', id: result.insertId });
    });
};

exports.actualizarMedico = (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono } = req.body;
    const validationError = validateDoctor({ nombre, apellido, telefono });
    if (validationError) return res.status(400).json({ message: validationError });
    const sql = 'UPDATE medico SET nombre = ?, apellido = ?, telefono = ? WHERE id_medico = ?';
    db.query(sql, [nombre.trim(), apellido.trim(), telefono, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar medico' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medico no encontrado' });
        }
        res.json({ message: 'Medico actualizado exitosamente' });
    });
};

exports.eliminarMedico = (req, res) => {
    const { id } = req.params;
    db.query('SELECT COUNT(*) AS total FROM cita WHERE id_medico = ?', [id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar medico' });
        }
        if (Number(rows[0].total) > 0) {
            return res.status(409).json({ message: 'No se puede eliminar un médico con citas asociadas' });
        }
        db.query('DELETE FROM medico WHERE id_medico = ?', [id], (deleteErr, result) => {
            if (deleteErr) return res.status(500).json({ message: 'Error al eliminar medico' });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Medico no encontrado' });
            res.json({ message: 'Medico eliminado exitosamente' });
        });
    });
};
