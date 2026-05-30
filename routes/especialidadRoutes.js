const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');
const { permitirRoles } = require('../middleware/auth');

router.get('/', especialidadController.obtenerEspecialidades);
router.get('/:id', especialidadController.obtenerEspecialidadPorId);
router.post('/', permitirRoles('admin'), especialidadController.crearEspecialidad);
router.put('/:id', permitirRoles('admin'), especialidadController.actualizarEspecialidad);
router.delete('/:id', permitirRoles('admin'), especialidadController.eliminarEspecialidad);

module.exports = router;
