const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');
const { permitirRoles } = require('../middleware/auth');

router.use(permitirRoles('admin', 'recepcion'));
router.post('/', facturaController.crearFactura);
router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFacturaPorId);
router.put('/:id/estado', facturaController.actualizarEstado);
router.delete('/:id', facturaController.eliminarFactura);

module.exports = router;
