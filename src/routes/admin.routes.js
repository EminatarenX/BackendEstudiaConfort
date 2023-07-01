const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/Admin.controller')
const checkAuth = require('../middleware/checkAuth')

router.get('/', checkAuth, AdminController.obtenerUsuarios)
router.post('/', checkAuth, AdminController.cambiarEstado)
router.delete('/:id', checkAuth, AdminController.eliminarSolicitud)



module.exports = router