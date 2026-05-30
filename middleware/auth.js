const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET debe estar configurado en .env');

exports.autenticar = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Autenticacion requerida' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Sesion invalida o expirada' });
    }
};

exports.permitirRoles = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta accion' });
    }
    next();
};
