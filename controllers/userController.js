const db = require("../config/db");

exports.getUsers = (req, res) => {
  const query = "SELECT * FROM usuario";

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    res.json(results);
  });
};

exports.getUserById = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM usuario WHERE Id = ?";

  db.query(query, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    if (results.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(results[0]);
  });
};

exports.createUser = (req, res) => {
  const { nombre, email } = req.body;

  const query = "INSERT INTO usuario (nombre, email) VALUES (?, ?)";

  db.query(query, [nombre, email], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });

    res.status(201).json({ message: "Usuario creado", id: result.insertId });
  });
};

exports.updateUser = (req, res) => {
  const id = req.params;
  const { nombre, email } = req.body;

  const query = "UPDATE usuario SET nombre = ?, email = ? WHERE Id = ?";

  db.query(query, [nombre, email, id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al hacer la peticion" });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado" });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params;

  const query = "DELETE FROM usuario WHERE Id = ?";

  db.query(query, [id], (err, result) => {
    if (err) res.status(500).json({ message: "Error al hacer la peticion" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado" });
  });


};
