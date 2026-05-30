const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { permitirRoles } = require('../middleware/auth');

router.get('/home-stats',           reporteController.homeStats);
router.use(permitirRoles('admin'));
router.get('/resumen',              reporteController.obtenerResumen);
router.get('/citas-por-estado',     reporteController.citasPorEstado);
router.get('/citas-por-medico',     reporteController.citasPorMedico);
router.get('/medicamentos-top',     reporteController.medicamentosTop);
router.get('/consultas-recientes',  reporteController.consultasRecientes);
router.get('/pacientes-atendidos',  reporteController.pacientesAtendidos);
router.get('/medicamentos-reporte', reporteController.medicamentosReporte);
router.get('/doctores-reporte',     reporteController.doctoresReporte);
router.get('/citas-reporte',        reporteController.citasReporte);
router.get('/paciente-frecuente',   reporteController.pacienteFrecuente);
router.get('/doctor-mas-trabajo',   reporteController.doctorMasTrabajo);

module.exports = router;
