const db = require('../config/db');

const validarMedicamento = ({ nombre, stock, precio }) => {
    if (!nombre || !nombre.trim() || nombre.trim().length > 100) return 'El nombre del medicamento es obligatorio y no puede superar 100 caracteres';
    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) return 'El stock debe ser un entero mayor o igual a cero';
    if (!Number.isFinite(Number(precio)) || Number(precio) < 0) return 'El precio debe ser mayor o igual a cero';
    return null;
};

exports.obtenerMedicamentos = (req, res) => {
    db.query('SELECT * FROM medicamento ORDER BY nombre', (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener medicamentos', error: err.message });
        res.json(result);
    });
};

exports.obtenerMedicamentoPorId = (req, res) => {
    db.query('SELECT * FROM medicamento WHERE id_medicamento = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener el medicamento', error: err.message });
        if (result.length === 0) return res.status(404).json({ message: 'Medicamento no encontrado' });
        res.json(result[0]);
    });
};

exports.crearMedicamento = (req, res) => {
    const { nombre, descripcion = '', stock = 0, precio = 0 } = req.body;
    const errorValidacion = validarMedicamento({ nombre, stock, precio });
    if (errorValidacion) return res.status(400).json({ message: errorValidacion });

    const sql = 'INSERT INTO medicamento (nombre, descripcion, stock, precio) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre.trim(), descripcion, Number(stock), Number(precio)], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al crear medicamento', error: err.message });
        res.status(201).json({ message: 'Medicamento creado exitosamente', id: result.insertId });
    });
};

exports.actualizarMedicamento = (req, res) => {
    const { nombre, descripcion = '', stock, precio } = req.body;
    const errorValidacion = validarMedicamento({ nombre, stock, precio });
    if (errorValidacion) return res.status(400).json({ message: errorValidacion });

    const sql = 'UPDATE medicamento SET nombre = ?, descripcion = ?, stock = ?, precio = ? WHERE id_medicamento = ?';
    db.query(sql, [nombre.trim(), descripcion, Number(stock), Number(precio), req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar medicamento', error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicamento no encontrado' });
        res.json({ message: 'Medicamento actualizado exitosamente' });
    });
};

exports.eliminarMedicamento = (req, res) => {
    db.query(`
        SELECT
            (SELECT COUNT(*) FROM receta_medicamento WHERE id_medicamento = ?) +
            (SELECT COUNT(*) FROM factura_detalle WHERE id_medicamento = ?) AS total
    `, [req.params.id, req.params.id], (relationErr, rows) => {
        if (relationErr) return res.status(500).json({ message: 'Error al validar medicamento', error: relationErr.message });
        if (Number(rows[0].total) > 0) {
            return res.status(409).json({ message: 'No se puede eliminar un medicamento asociado a recetas o facturas' });
        }
        db.query('DELETE FROM medicamento WHERE id_medicamento = ?', [req.params.id], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al eliminar medicamento', error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Medicamento no encontrado' });
            res.json({ message: 'Medicamento eliminado correctamente' });
        });
    });
};
