const db = require("../config/db");

exports.obtenerPacientes = (req, res) => {
  const query = "SELECT * FROM paciente";

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    res.json(results);
  });
};

exports.obtenerPacientePorId = (req, res) => {
  const id = req.params;

  const query = "SELECT * FROM paciente WHERE id_paciente = ?";

  db.query(query, [id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    if (result.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(result[0]);
  });
};

exports.crearPaciente = (req, res) => {
  const { nombre, apellido, fecha_nacimiento, telefono, direccion } = req.body;

  const query = "INSERT INTO paciente (nombre, apellido, fecha_nacimiento, telefono, direccion) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [nombre, apellido, fecha_nacimiento, telefono, direccion],
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

  const query = "UPDATE paciente SET nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, direccion = ? WHERE id_paciente = ?";

  db.query(
    query,
    [nombre, apellido, fecha_nacimiento, telefono, direccion, id],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al hacer la peticion", error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });

      res.json({ message: "Paciente actualizado" });
    },
  );
};

exports.eliminarPaciente = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM paciente WHERE id_paciente = ?";

  db.query(query, [id], (err, result) => {
    if (err) res.status(500).json({ message: "Error al hacer la peticion" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json({ message: "Paciente eliminado" });

  });


};
