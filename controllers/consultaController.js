const db = require('../config/db');
const { isNonEmptyText, isPositiveInteger, validatePrescription } = require('../utils/entityValidation');

const validarConsulta = ({ id_cita, diagnostico, tratamiento, comentarios = '', medicamentos = [] }, requiereCita = true) => {
    if (requiereCita && !isPositiveInteger(id_cita)) return 'El ID de cita es obligatorio';
    if (!isNonEmptyText(diagnostico, 5000)) return 'El diagnóstico es obligatorio y no puede superar 5000 caracteres';
    if (!isNonEmptyText(tratamiento, 5000)) return 'El tratamiento es obligatorio y no puede superar 5000 caracteres';
    if (typeof comentarios !== 'string' || comentarios.length > 5000) return 'Los comentarios no pueden superar 5000 caracteres';
    return validatePrescription(medicamentos);
};

const responderErrorConsulta = (res, err, fallback) => {
    if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'La cita ya tiene una consulta o la receta repite un medicamento' });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ message: 'La cita o uno de los medicamentos no existe' });
    return res.status(500).json({ message: fallback });
};

// Registro completo: Consulta + Receta + Medicamentos
exports.registrarConsultaCompleta = async (req, res) => {
    const { id_cita, diagnostico, tratamiento, comentarios = '', medicamentos = [] } = req.body;

    const validationError = validarConsulta({ id_cita, diagnostico, tratamiento, comentarios, medicamentos });
    if (validationError) return res.status(400).json({ message: validationError });

    // Usamos una promesa para manejar la transacción de mysql2 de forma más limpia
    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Error al iniciar transacción' });

        // 1. Insertar en consulta
        const queryConsulta = 'INSERT INTO consulta (id_cita, diagnostico, tratamiento, comentarios) VALUES (?, ?, ?, ?)';
        db.query(queryConsulta, [id_cita, diagnostico.trim(), tratamiento.trim(), comentarios.trim()], (err, resultConsulta) => {
            if (err) {
                return db.rollback(() => {
                    responderErrorConsulta(res, err, 'Error al crear la consulta');
                });
            }

            const id_consulta = resultConsulta.insertId;

            // 2. Insertar en receta
            const fechaActual = new Date().toISOString().slice(0, 10);
            const queryReceta = 'INSERT INTO receta (id_consulta, fecha) VALUES (?, ?)';
            db.query(queryReceta, [id_consulta, fechaActual], (err, resultReceta) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Error al crear la receta', error: err });
                    });
                }

                const id_receta = resultReceta.insertId;

                // 3. Insertar medicamentos (si existen)
                if (medicamentos && medicamentos.length > 0) {
                    const queryMed = 'INSERT INTO receta_medicamento (id_receta, id_medicamento, dosis) VALUES ?';
                    const values = medicamentos.map(m => [id_receta, m.id_medicamento, m.dosis.trim()]);

                    db.query(queryMed, [values], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                responderErrorConsulta(res, err, 'Error al registrar medicamentos');
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({ message: 'Error al confirmar transacción', error: err });
                                });
                            }
                            res.json({ message: 'Consulta y receta registradas exitosamente', id_consulta, id_receta });
                        });
                    });
                } else {
                    // Si no hay medicamentos, commit directo
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ message: 'Error al confirmar transacción', error: err });
                            });
                        }
                        res.json({ message: 'Consulta registrada exitosamente (sin medicamentos)', id_consulta, id_receta });
                    });
                }
            });
        });
    });
};

// Editar notas clínicas y reemplazar la receta completa.
exports.actualizarConsultaCompleta = (req, res) => {
    const { id } = req.params;
    const { diagnostico, tratamiento, comentarios = '', medicamentos = [] } = req.body;
    const validationError = validarConsulta({ diagnostico, tratamiento, comentarios, medicamentos }, false);
    if (validationError) return res.status(400).json({ message: validationError });

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: 'Error al iniciar transaccion' });
        db.query(
            'UPDATE consulta SET diagnostico = ?, tratamiento = ?, comentarios = ? WHERE id_consulta = ?',
            [diagnostico.trim(), tratamiento.trim(), comentarios.trim(), id],
            (err2, result) => {
                if (err2 || result.affectedRows === 0) {
                    return db.rollback(() => res.status(err2 ? 500 : 404).json({ message: err2 ? 'Error al actualizar consulta' : 'Consulta no encontrada' }));
                }
                db.query('SELECT id_receta FROM receta WHERE id_consulta = ?', [id], (err3, recetas) => {
                    if (err3 || recetas.length === 0) {
                        return db.rollback(() => res.status(500).json({ message: 'No se encontro la receta asociada' }));
                    }
                    const idReceta = recetas[0].id_receta;
                    db.query('DELETE FROM receta_medicamento WHERE id_receta = ?', [idReceta], (err4) => {
                        if (err4) return db.rollback(() => res.status(500).json({ message: 'Error al actualizar receta' }));
                        const values = medicamentos.map(m => [idReceta, m.id_medicamento, m.dosis.trim()]);
                        if (values.length === 0) return db.commit(() => res.json({ message: 'Consulta actualizada exitosamente' }));
                        db.query('INSERT INTO receta_medicamento (id_receta, id_medicamento, dosis) VALUES ?', [values], (err5) => {
                            if (err5) return db.rollback(() => responderErrorConsulta(res, err5, 'Error al actualizar medicamentos'));
                            db.commit((err6) => {
                                if (err6) return db.rollback(() => res.status(500).json({ message: 'Error al confirmar transaccion' }));
                                res.json({ message: 'Consulta y receta actualizadas exitosamente' });
                            });
                        });
                    });
                });
            }
        );
    });
};

// Obtener reporte detallado para el front-end
exports.obtenerReporteDetallado = (req, res) => {
    const { id_cita } = req.params;

    const sql = `
        SELECT 
            c.id_cita, c.fecha as fecha_cita, c.hora,
            p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.direccion as paciente_direccion,
            m.nombre as medico_nombre, m.apellido as medico_apellido,
            con.diagnostico, con.tratamiento,
            r.id_receta,
            med.nombre as medicamento_nombre, rm.dosis
        FROM cita c
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN medico m ON c.id_medico = m.id_medico
        LEFT JOIN consulta con ON c.id_cita = con.id_cita
        LEFT JOIN receta r ON con.id_consulta = r.id_consulta
        LEFT JOIN receta_medicamento rm ON r.id_receta = rm.id_receta
        LEFT JOIN medicamento med ON rm.id_medicamento = med.id_medicamento
        WHERE c.id_cita = ?
    `;

    db.query(sql, [id_cita], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener el reporte', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontró información para esta cita' });
        }

        // Formatear la respuesta para que los medicamentos vengan en un array
        const reporte = {
            id_cita: results[0].id_cita,
            fecha: results[0].fecha_cita,
            hora: results[0].hora,
            paciente: {
                nombre: `${results[0].paciente_nombre} ${results[0].paciente_apellido}`,
                direccion: results[0].paciente_direccion
            },
            medico: {
                nombre: `${results[0].medico_nombre} ${results[0].medico_apellido}`
            },
            consulta: {
                diagnostico: results[0].diagnostico,
                tratamiento: results[0].tratamiento
            },
            receta: {
                id_receta: results[0].id_receta,
                medicamentos: results.map(row => ({
                    nombre: row.medicamento_nombre,
                    dosis: row.dosis
                })).filter(med => med.nombre !== null) // Filtrar si no hay medicamentos
            }
        };

        res.json(reporte);
    });
};

// Obtener todas las consultas (lista general)
exports.obtenerConsultas = (req, res) => {
    const sql = 'SELECT * FROM consulta';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener consultas', error: err });
        }
        res.json(result);
    });
};

// Obtener una consulta por su propio ID (incluye medicamentos de la receta)
exports.obtenerConsultaPorId = (req, res) => {
    const { id } = req.params;

    const sqlConsulta = 'SELECT * FROM consulta WHERE id_consulta = ?';
    db.query(sqlConsulta, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al obtener la consulta', error: err });
        if (result.length === 0) return res.status(404).json({ message: 'Consulta no encontrada' });

        const consulta = result[0];

        const sqlMeds = `
            SELECT rm.id_medicamento, rm.dosis, med.nombre
            FROM receta r
            JOIN receta_medicamento rm ON r.id_receta = rm.id_receta
            JOIN medicamento med ON rm.id_medicamento = med.id_medicamento
            WHERE r.id_consulta = ?
        `;
        db.query(sqlMeds, [id], (err2, meds) => {
            if (err2) return res.status(500).json({ message: 'Error al obtener medicamentos', error: err2 });
            res.json({ ...consulta, medicamentos: meds });
        });
    });
};
