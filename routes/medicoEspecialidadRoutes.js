const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicoEspecialidadController');
const { permitirRoles } = require('../middleware/auth');

// Listar todas las relaciones
router.get('/', controller.listarRelaciones);

// Obtener especialidades por medico
router.get('/medico/:id', controller.obtenerEspecialidadesPorMedico);

// Obtener medicos por especialidad
router.get('/especialidad/:id', controller.obtenerMedicosPorEspecialidad);

// Asignar especialidad a medico
router.post('/', permitirRoles('admin'), controller.asignarEspecialidadAmedico);

// Quitar especialidad a medico (id_medico e id_especialidad en body)
router.delete('/', permitirRoles('admin'), controller.quitarEspecialidadAMedico);

module.exports = router;
