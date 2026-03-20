const express = require('express');
const router = express.Router();

const medicoController = require('../controllers/medicoController');

router.get('/', medicoController.obtenerMedicos);
router.get('/:id', medicoController.obtenerMedicoPorId);
router.post('/', medicoController.crearMedico);
router.put('/:id', medicoController.actualizarMedico);
router.delete('/:id', medicoController.eliminarMedico);

module.exports = router;