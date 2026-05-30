const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET debe estar configurado en .env');
const ROLES_VALIDOS = ['admin', 'medico', 'recepcion'];

exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos' });

    db.query('SELECT * FROM usuario WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error interno del servidor' });
        if (results.length === 0) return res.status(401).json({ message: 'Credenciales inválidas' });

        const user = results[0];
        if (!ROLES_VALIDOS.includes(user.rol) || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id_usuario, email: user.email, rol: user.rol, nombre: user.nombre },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token, user: { id: user.id_usuario, nombre: user.nombre, email: user.email, rol: user.rol } });
    });
};
