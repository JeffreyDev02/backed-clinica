const express = require('express');
const router = express.Router();

const citaController = require('../controllers/citaController');
const { permitirRoles } = require('../middleware/auth');

router.get('/', citaController.obtenerCitas);
router.get('/:id', citaController.obtenerCitaPorId);
router.post('/', permitirRoles('admin', 'recepcion'), citaController.crearCita);
router.put('/:id', permitirRoles('admin', 'recepcion'), citaController.actualizarCita);
router.delete('/:id', permitirRoles('admin', 'recepcion'), citaController.eliminarCita);

module.exports = router;
