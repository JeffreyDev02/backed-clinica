const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');

router.get('/', especialidadController.obtenerEspecialidades);
router.get('/:id', especialidadController.obtenerEspecialidadPorId);
router.post('/', especialidadController.crearEspecialidad);
router.put('/:id', especialidadController.actualizarEspecialidad);
router.delete('/:id', especialidadController.eliminarEspecialidad);

module.exports = router;
