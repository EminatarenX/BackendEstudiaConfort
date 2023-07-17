const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/Admin.controller')
const checkAuth = require('../middleware/checkAuth')

router.get('/', checkAuth, AdminController.obtenerUsuarios)
router.post('/', checkAuth, AdminController.cambiarEstado)
router.delete('/:id', checkAuth, AdminController.eliminarSolicitud)
router.get('/habitaciones', checkAuth, AdminController.obtenerHabitaciones)
router.post('/pagar', checkAuth, AdminController.pagarServicio)
router.put('/renta/:id', checkAuth, AdminController.modificarPago)
router.get('/historial', checkAuth, AdminController.historial)



module.exports = router