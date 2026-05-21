const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicoEspecialidadController');

// Listar todas las relaciones
router.get('/', controller.listarRelaciones);

// Obtener especialidades por medico
router.get('/medico/:id', controller.obtenerEspecialidadesPorMedico);

// Obtener medicos por especialidad
router.get('/especialidad/:id', controller.obtenerMedicosPorEspecialidad);

// Asignar especialidad a medico
router.post('/', controller.asignarEspecialidadAmedico);

// Quitar especialidad a medico (id_medico e id_especialidad en body)
router.delete('/', controller.quitarEspecialidadAMedico);

module.exports = router;
