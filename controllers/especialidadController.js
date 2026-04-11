const db = require('../config/db');

// Obtener todas las especialidades
exports.obtenerEspecialidades = (req, res) => {
    const sql = 'SELECT * FROM especialidad';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener especialidades', error: err });
        }
        res.json(result);
    });
};

// Obtener una especialidad por ID
exports.obtenerEspecialidadPorId = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM especialidad WHERE id_especialidad = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener la especialidad', error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json(result[0]);
    });
};

// Crear una nueva especialidad
exports.crearEspecialidad = (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la especialidad es obligatorio' });
    }

    const sql = 'INSERT INTO especialidad (nombre) VALUES (?)';
    db.query(sql, [nombre], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al crear especialidad', error: err });
        }
        res.json({ message: 'Especialidad creada exitosamente', id: result.insertId });
    });
};

// Actualizar una especialidad
exports.actualizarEspecialidad = (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la especialidad es obligatorio' });
    }

    const sql = 'UPDATE especialidad SET nombre = ? WHERE id_especialidad = ?';
    db.query(sql, [nombre, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar especialidad', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json({ message: 'Especialidad actualizada exitosamente' });
    });
};

// Eliminar una especialidad
exports.eliminarEspecialidad = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM especialidad WHERE id_especialidad = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar especialidad', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json({ message: 'Especialidad eliminada correctamente' });
    });
};
