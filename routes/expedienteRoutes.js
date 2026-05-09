const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');

router.get('/:id',          expedienteController.obtenerExpediente);
router.post('/:id/historial', expedienteController.agregarHistorial);

module.exports = router;
