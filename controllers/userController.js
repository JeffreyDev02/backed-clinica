const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mediconnect_secret_key_2026';
const SALT_ROUNDS = 10;

// ── Login ─────────────────────────────────────────────────────
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });

    const query = 'SELECT * FROM usuario WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error interno del servidor' });
        if (results.length === 0)
            return res.status(401).json({ message: 'Credenciales inválidas' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: user.id_usuario, email: user.email, rol: user.rol, nombre: user.nombre },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol }
        });
    });
};

// ── Seed admin (crea el usuario admin inicial con password hasheado) ──
exports.seedAdmin = (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password)
        return res.status(400).json({ message: 'nombre, email y password son requeridos' });

    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error al hashear contraseña' });

        const query = `
            INSERT INTO usuario (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE password = VALUES(password), rol = VALUES(rol)
        `;
        db.query(query, [nombre, email, hash, rol || 'admin'], (err2, result) => {
            if (err2) return res.status(500).json({ message: 'Error al crear usuario', error: err2 });
            res.status(201).json({ message: 'Usuario creado/actualizado', id: result.insertId || null });
        });
    });
};

// ── CRUD básico ───────────────────────────────────────────────
exports.getUsers = (req, res) => {
    const query = 'SELECT id_usuario, nombre, email, rol FROM usuario';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al hacer la peticion' });
        res.json(results);
    });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id_usuario, nombre, email, rol FROM usuario WHERE id_usuario = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error al hacer la peticion' });
        if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(results[0]);
    });
};

exports.createUser = (req, res) => {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password)
        return res.status(400).json({ message: 'nombre, email y password son requeridos' });

    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error al hashear contraseña' });
        const query = 'INSERT INTO usuario (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, email, hash, rol || 'recepcion'], (err2, result) => {
            if (err2) return res.status(500).json({ message: 'Error al crear usuario', error: err2 });
            res.status(201).json({ message: 'Usuario creado', id: result.insertId });
        });
    });
};

exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;
    const query = 'UPDATE usuario SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?';
    db.query(query, [nombre, email, rol, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al hacer la peticion' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado' });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM usuario WHERE id_usuario = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al hacer la peticion' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    });
};
