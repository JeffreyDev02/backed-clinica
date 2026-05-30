const express = require('express');
const router = express.Router();

const medicoController = require('../controllers/medicoController');
const { permitirRoles } = require('../middleware/auth');

router.get('/', medicoController.obtenerMedicos);
router.get('/:id', medicoController.obtenerMedicoPorId);
router.post('/', permitirRoles('admin'), medicoController.crearMedico);
router.put('/:id', permitirRoles('admin'), medicoController.actualizarMedico);
router.delete('/:id', permitirRoles('admin'), medicoController.eliminarMedico);

module.exports = router;
