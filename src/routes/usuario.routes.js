const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const UsuarioController = require('../controllers/UsuarioController')

router.post('/',checkAuth,UsuarioController.actualizarDatos)
router.get('/',checkAuth, UsuarioController.obtenerDatosPersonales)

module.exports = router