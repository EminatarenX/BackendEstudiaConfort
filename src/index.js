require('dotenv').config()
const cors = require('cors')
const express = require('express')
const {getConnection} = require('./db/connection')
const app = express()

const puerto = process.env.PUERTO
getConnection()

app.use(cors())

app.use(express.json())
// app.use(express.urlencoded({extended: true}))

const rutasAdministrador = require('./routes/admin.routes')
const rutasAuth = require('./routes/auth.routes')
const rutasUsuario = require('./routes/usuario.routes')

app.use('/api/admin',rutasAdministrador)
app.use('/api/auth', rutasAuth)
app.use('/api/usuario', rutasUsuario)

app.listen(puerto, () => {
  console.log("*** RUNNING AT PORT ", puerto, " ***")
})
