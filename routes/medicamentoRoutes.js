const express = require('express');
const router = express.Router();
const medicamentoController = require('../controllers/medicamentoController');

router.get('/', medicamentoController.obtenerMedicamentos);
router.get('/:id', medicamentoController.obtenerMedicamentoPorId);
router.post('/', medicamentoController.crearMedicamento);
router.put('/:id', medicamentoController.actualizarMedicamento);
router.delete('/:id', medicamentoController.eliminarMedicamento);

module.exports = router;
