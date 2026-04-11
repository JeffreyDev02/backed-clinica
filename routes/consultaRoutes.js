const express = require('express');
const router = express.Router();
const consultaController = require('../controllers/consultaController');

// POST para registrar consulta, receta y medicamentos al mismo tiempo
router.post('/', consultaController.registrarConsultaCompleta);

// GET para obtener todas las consultas
router.get('/', consultaController.obtenerConsultas);

// GET para obtener una consulta por su propio ID
router.get('/:id', consultaController.obtenerConsultaPorId);

// GET para obtener el reporte completo de la consulta por ID de Cita
router.get('/reporte/:id_cita', consultaController.obtenerReporteDetallado);

module.exports = router;
