const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/Admin.controller')

router.get("/estudiantes/:id", AdminController.obtenerUsuarios)

module.exports = router