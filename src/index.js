require('dotenv').config()
const cors = require('cors')
const express = require('express')
const {getConnection} = require('./db/connection')
const app = express()
const path = require('path')

app.use(cors({
  origin: 'http://localhost:5173',  
}))

app.use(express.json())

const puerto = process.env.PUERTO
getConnection()




const rutasAdministrador = require('./routes/admin.routes')
const rutasAuth = require('./routes/auth.routes')
const rutasUsuario = require('./routes/usuario.routes')
const rutasHabitacion = require('./routes/habitacion.routes')

app.use('/api/img', express.static(path.join(__dirname, 'uploads', 'habitaciones')));
app.use('/api/admin',rutasAdministrador)
app.use('/api/auth', rutasAuth)
app.use('/api/usuario', rutasUsuario),
app.use('/api/habitacion', rutasHabitacion)

app.listen(puerto, () => {
  console.log("*** RUNNING AT PORT ", puerto, " ***")
})
