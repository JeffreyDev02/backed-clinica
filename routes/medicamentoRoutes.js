const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');
const { permitirRoles } = require('../middleware/auth');

router.get('/', medicamentoController.obtenerMedicamentos);
router.get('/:id', medicamentoController.obtenerMedicamentoPorId);
router.post('/', permitirRoles('admin'), medicamentoController.crearMedicamento);
router.put('/:id', permitirRoles('admin'), medicamentoController.actualizarMedicamento);
router.delete('/:id', permitirRoles('admin'), medicamentoController.eliminarMedicamento);

module.exports = router;
