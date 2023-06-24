const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/Admin.controller')


router.route("/habitacion/:id", (req, res)=> res.json({msg: "hola desde admin"}) )


module.exports = router