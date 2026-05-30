const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');
const { permitirRoles } = require('../middleware/auth');

// POST para registrar consulta, receta y medicamentos al mismo tiempo
router.post('/', permitirRoles('admin', 'medico'), consultaController.registrarConsultaCompleta);
router.put('/:id', permitirRoles('admin', 'medico'), consultaController.actualizarConsultaCompleta);

// GET para obtener todas las consultas
router.get('/', consultaController.obtenerConsultas);

// GET para obtener el reporte completo de la consulta por ID de Cita
router.get('/reporte/:id_cita', consultaController.obtenerReporteDetallado);

// GET para obtener una consulta por su propio ID
router.get('/:id', consultaController.obtenerConsultaPorId);

module.exports = router;
