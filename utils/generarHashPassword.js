const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
    console.error('Uso: node utils/generarHashPassword.js "TuPassword"');
    process.exit(1);
}

bcrypt.hash(password, 10)
    .then((hash) => console.log(hash))
    .catch((error) => {
        console.error('No se pudo generar el hash:', error.message);
        process.exit(1);
    });
