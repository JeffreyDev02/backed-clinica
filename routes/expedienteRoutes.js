const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');
const { permitirRoles } = require('../middleware/auth');

router.get('/:id',          expedienteController.obtenerExpediente);
router.post('/:id/historial', permitirRoles('admin', 'medico'), expedienteController.agregarHistorial);

module.exports = router;
