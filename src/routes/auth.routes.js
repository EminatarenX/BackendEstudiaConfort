const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/Auth.controller')
const checkAuth = require('../middleware/checkAuth')

// router.post('/admin/registro', AuthController.registrarAdministrador)
// router.post('/admin/login', AuthController.iniciarSesionAdmin)
// router.get('/admin/confirmar/:token', AuthController.confirmarAdmin)
router.get('/usuario/perfil',checkAuth, AuthController.perfilUsuario)
router.post('/usuario/registro',   AuthController.registrarUsuario)
router.post('/usuario/login', AuthController.iniciarSesionUsuario)
router.get('/usuario/confirmar/:token', AuthController.confirmarUsuario)


module.exports = router 