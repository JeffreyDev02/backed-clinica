const db = require('../config/db');

// Obtener todos los medicamentos
exports.obtenerMedicamentos = (req, res) => {
    const sql = 'SELECT * FROM medicamento';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener medicamentos', error: err });
        }
        res.json(result);
    });
};

// Obtener un medicamento por ID
exports.obtenerMedicamentoPorId = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM medicamento WHERE id_medicamento = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener el medicamento', error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json(result[0]);
    });
};

// Crear un nuevo medicamento
exports.crearMedicamento = (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'El nombre del medicamento es obligatorio' });
    }

    const sql = 'INSERT INTO medicamento (nombre, descripcion) VALUES (?, ?)';
    db.query(sql, [nombre, descripcion], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al crear medicamento', error: err });
        }
        res.json({ message: 'Medicamento creado exitosamente', id: result.insertId });
    });
};

// Actualizar un medicamento
exports.actualizarMedicamento = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const sql = 'UPDATE medicamento SET nombre = ?, descripcion = ? WHERE id_medicamento = ?';
    db.query(sql, [nombre, descripcion, id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al actualizar medicamento', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json({ message: 'Medicamento actualizado exitosamente' });
    });
};

// Eliminar un medicamento
exports.eliminarMedicamento = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM medicamento WHERE id_medicamento = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar medicamento', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        res.json({ message: 'Medicamento eliminado correctamente' });
    });
};
