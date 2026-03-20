const express = require('express');
const router = express.Router();

const citaController = require('../controllers/citaController');

router.get('/', citaController.obtenerCitas);
router.get('/:id', citaController.obtenerCitaPorId);
router.post('/', citaController.crearCita);
router.put('/:id', citaController.actualizarCita);
router.delete('/:id', citaController.eliminarCita);

module.exports = router;