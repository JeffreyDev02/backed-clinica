const db = require("../config/db");
const { validatePatient } = require('../utils/entityValidation');

exports.obtenerPacientes = (req, res) => {
  const query = "SELECT * FROM paciente";

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    res.json(results);
  });
};

exports.obtenerPacientePorId = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM paciente WHERE id_paciente = ?";

  db.query(query, [id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    if (result.length === 0)
      return res.status(404).json({ message: "Paciente no encontrado" });

    res.json(result[0]);
  });
};

exports.crearPaciente = (req, res) => {
  const { nombre, apellido, fecha_nacimiento, telefono, direccion } = req.body;
  const validationError = validatePatient({ nombre, apellido, fecha_nacimiento, telefono, direccion });
  if (validationError) return res.status(400).json({ message: validationError });

  const query = "INSERT INTO paciente (nombre, apellido, fecha_nacimiento, telefono, direccion) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [nombre.trim(), apellido.trim(), fecha_nacimiento, telefono, direccion.trim()],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al hacer la peticion" });

      res.status(201).json({ message: "Paciente Creado", id: result.insertId });
    },
  );
};

exports.actualizarPaciente = (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, fecha_nacimiento, telefono, direccion } = req.body;
  const validationError = validatePatient({ nombre, apellido, fecha_nacimiento, telefono, direccion });
  if (validationError) return res.status(400).json({ message: validationError });

  const query = "UPDATE paciente SET nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, direccion = ? WHERE id_paciente = ?";

  db.query(
    query,
    [nombre.trim(), apellido.trim(), fecha_nacimiento, telefono, direccion.trim(), id],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al hacer la peticion", error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Paciente no encontrado" });

      res.json({ message: "Paciente actualizado" });
    },
  );
};

exports.eliminarPaciente = (req, res) => {
  const { id } = req.params;

  const queryRelacionados = `
    SELECT
      (SELECT COUNT(*) FROM cita WHERE id_paciente = ?) +
      (SELECT COUNT(*) FROM factura WHERE id_paciente = ?) +
      (SELECT COUNT(*) FROM historial_medico WHERE id_paciente = ?) AS total
  `;

  db.query(queryRelacionados, [id, id, id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error al hacer la peticion" });
    if (Number(rows[0].total) > 0) {
      return res.status(409).json({ message: "No se puede eliminar un paciente con citas, facturas o historial clínico" });
    }

    db.query("DELETE FROM paciente WHERE id_paciente = ?", [id], (deleteErr, result) => {
      if (deleteErr) return res.status(500).json({ message: "Error al eliminar paciente" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Paciente no encontrado" });
      res.json({ message: "Paciente eliminado" });
    });
  });
};
