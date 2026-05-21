const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');

router.post('/', facturaController.crearFactura);
router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.put('/:id/estado', facturaController.actualizarEstado);
router.delete('/:id', facturaController.eliminarFactura);

module.exports = router;
