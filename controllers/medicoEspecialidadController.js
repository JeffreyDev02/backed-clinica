const db = require('../config/db');

// Listar todas las relaciones medico-especialidad
exports.listarRelaciones = (req, res) => {
    const sql = `SELECT me.id_medico, me.id_especialidad, m.nombre AS nombre_medico, m.apellido AS apellido_medico, e.nombre AS nombre_especialidad
                 FROM medico_especialidad me
                 JOIN medico m ON me.id_medico = m.id_medico
                 JOIN especialidad e ON me.id_especialidad = e.id_especialidad`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al listar relaciones', error: err });
        res.json(result);
    });
};

// Obtener especialidades de un medico
exports.obtenerEspecialidadesPorMedico = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT e.* FROM especialidad e
                 JOIN medico_especialidad me ON e.id_especialidad = me.id_especialidad
                 WHERE me.id_medico = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener especialidades del medico', error: err });
        res.json(result);
    });
};

// Obtener medicos de una especialidad
exports.obtenerMedicosPorEspecialidad = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT m.* FROM medico m
                 JOIN medico_especialidad me ON m.id_medico = me.id_medico
                 WHERE me.id_especialidad = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener medicos de la especialidad', error: err });
        res.json(result);
    });
};

// Asignar una especialidad a un medico
exports.asignarEspecialidadAmedico = (req, res) => {
    const { id_medico, id_especialidad } = req.body || {};
    if (!id_medico || !id_especialidad) {
        return res.status(400).json({ message: 'id_medico e id_especialidad son requeridos' });
    }

    const checkSql = 'SELECT * FROM medico_especialidad WHERE id_medico = ? AND id_especialidad = ?';
    db.query(checkSql, [id_medico, id_especialidad], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error al comprobar relación', error: err });
        if (rows.length > 0) return res.status(409).json({ message: 'La relación ya existe' });

        const sql = 'INSERT INTO medico_especialidad (id_medico, id_especialidad) VALUES (?, ?)';
        db.query(sql, [id_medico, id_especialidad], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error al asignar especialidad', error: err });
            res.json({ message: 'Especialidad asignada al medico', id_medico, id_especialidad });
        });
    });
};

// Quitar una especialidad a un medico
exports.quitarEspecialidadAMedico = (req, res) => {
    const { id_medico, id_especialidad } = req.body || {};
    if (!id_medico || !id_especialidad) {
        return res.status(400).json({ message: 'id_medico e id_especialidad son requeridos' });
    }

    const sql = 'DELETE FROM medico_especialidad WHERE id_medico = ? AND id_especialidad = ?';
    db.query(sql, [id_medico, id_especialidad], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al quitar especialidad', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Relación no encontrada' });
        res.json({ message: 'Especialidad removida del medico' });
    });
};
