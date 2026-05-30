const express = require('express');
const router = express.Router();

const pacienteController = require("../controllers/pacienteController");
const { permitirRoles } = require('../middleware/auth');

router.get('/', pacienteController.obtenerPacientes);
router.get('/:id', pacienteController.obtenerPacientePorId);
router.post('/', permitirRoles('admin', 'recepcion'), pacienteController.crearPaciente);
router.put('/:id', permitirRoles('admin', 'recepcion'), pacienteController.actualizarPaciente);
router.delete('/:id', permitirRoles('admin', 'recepcion'), pacienteController.eliminarPaciente);

module.exports = router;
