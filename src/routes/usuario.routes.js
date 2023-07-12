const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const UsuarioController = require('../controllers/UsuarioController')

router.post('/',checkAuth,UsuarioController.actualizarDatos)
router.get('/',checkAuth, UsuarioController.obtenerDatosPersonales)
router.post('/solicitud',checkAuth, UsuarioController.mandarSolicitud)
router.get('/habitacion',checkAuth, UsuarioController.obtenerHabitacion)

// 
module.exports = router