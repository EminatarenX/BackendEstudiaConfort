const jwt = require('jsonwebtoken')
const {getConnection} = require('../db/connection')

const checkAuth = async(req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {

      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const pool = await getConnection()

      const respuesta = await pool.
      request()
      .query(`SELECT id, correo, nombre
              FROM usuario
              WHERE id = '${decoded.id}'`)

      req.usuario = respuesta.recordset[0]
      
      return next()

    } catch (error) {
      return res.status(404).json({mensaje: 'Hubo un error'})

    }

  }

  if(!token){
    const error = new Error('Token no valido')
    res.status(401).json({mensaje: error.message})
  }

  next()
};

module.exports = checkAuth;
