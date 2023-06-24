const {getConnection} = require('../db/connection')
const bycrypt = require('bcrypt')
const {generarId} = require('../helpers/generarID')
const {generarJWT} = require('../helpers/generarJWT')
const { emailRegistro } = require('../helpers/emails')

  
const registrarAdministrador = async(req, res) => {
  const {nombre, correo, password} = req.body
  const saltRounds = 10


  try {
    
  const token = generarId()

  const hashedPassword = await bycrypt.hash(password, saltRounds)

 
    const pool = await getConnection()

    await pool.request().query(`INSERT INTO administrador (nombre, correo, password, token) VALUES ('${nombre}', '${correo}', '${hashedPassword}', '${token}') `)

    //enviar el email al administrador
    emailRegistro({
      correo,
      nombre,
      token
    })

    return res.status(200).json({
      mensaje: 'SUCCESS - USER CREATED',
      
    })

  } catch (error) {
    const invalid = error.message
    return res.status(400).json({
      mensaje: 'CANNOT POST',
      invalid
    })
  }
}

const registrarUsuario = async(req, res) => {
  const {nombre, correo, password} = req.body
  
  const saltRounds = 10

  try {

    const token = generarId()
    
    const hashedPassword = await bycrypt.hash(password, saltRounds)

      const pool = await getConnection()

      await pool.request()
      .query(`INSERT INTO usuario (nombre, correo, password, token) VALUES ('${nombre}', '${correo}', '${hashedPassword}', '${token}')`)
      //enviar email al administrador
      emailRegistro({
        correo,
        nombre,
        token
      })

      return res.status(200).json({
        mensaje: 'Hemos mandado un mensaje a tu correo para confirmar!',

      })
    
  } catch (error) {
 
    return res.status(400).json({
      mensaje: 'El correo ya ha sido registrado ',

    })

  }
  


  
}

const confirmarAdmin = async(req, res) => {

  const {token} = req.params

  try{

  const pool = await getConnection()

  const {recordset} = await pool.request().query(`SELECT * from administrador where token = '${token}'`)
  
  if(recordset.length === 0){
    return res.status(400).json({
      mensaje: 'TOKEN ALREADYCONFIRMED'
    })
  }

  const user = recordset[0]

  await pool.request().query(`UPDATE administrador SET confirmado = ~confirmado WHERE id = ${user.id}`)
    await pool.request().query(`UPDATE administrador SET token = '' WHERE id = ${user.id}`)

  return res.json({
    mensaje: 'EMAIL CONFIRMED!!'

  })

  }catch(error){
    const invalid = error.message
    return res.status(400).json({
      mensaje: 'INVALID TOKEN',
      invalid
    })
  }

}

const confirmarUsuario = async(req, res) => {
  const {token} = req.params

  try {
    
    const pool = await getConnection()

    const {recordset} = await pool.request().query(`SELECT * FROM usuario WHERE token = '${token}'`)
    
    if(recordset.length === 0 ){
      const error = new Error("El Token ya esta confirmado")
      return res.status(404).json({mensaje: error.message})
    }

    const user = recordset[0]

    await pool.request().query(`UPDATE usuario SET confirmado = ~confirmado WHERE id = '${user.id}'`)
    await pool.request().query(`UPDATE usuario SET token = '' WHERE id = '${user.id}' `)

    return res.json({
      mensaje: "EMAIL CONFIRMED!!!"
    })

  } catch (error) {
    const invalid = error.message
    return res.status(400).json({
      mensaje: "ERROR, CANNOT GET TOKEN",
      invalid
    })

  }
}

const iniciarSesionUsuario = async(req, res) => {

  const {correo, password} = req.body

  try {
    
    const pool = await getConnection()

    const {recordset} = await pool.request().query(`SELECT * FROM usuario WHERE correo = '${correo}'`)



    if(recordset.length === 0){

      return res.status(400).json({
        mensaje: 'Este usuario no esta registrado'
      })
    }

    const user = recordset[0]

   
    if(!user.confirmado){
      return res.status(400).json({
        mensaje: "Esta correo no esta confirmado"
      })
    }

    if(user.role === 'admin'){
      const confirmedPassword = await bycrypt.compare(password, user.password)

      if(!confirmedPassword){
        return res.status(400).json({
          mensaje: 'Contraseña incorrecta'
        })
      }

      const jwt = generarJWT(user.id)
      const nombre = user.nombre
  
  
      return res.status(200).json({
        // correo,
        nombre,
        jwt
  
      })
    }


    const confirmedPassword = await bycrypt.compare(password, user.password)

    if(!confirmedPassword){
      return res.status(400).json({
        mensaje: 'Contraseña incorrecta'
      })
    }

    const jwt = generarJWT(user.id)
    const nombre = user.nombre

    return res.status(200).json({
      // correo,
      nombre,
      jwt

    })

  } catch (error) {
    const invalid = error.message
    return res.status(400).json({
      mensaje: 'CANNOT POST USER',
      invalid
    })


  }
}

async function perfilUsuario (req, res){
  const {usuario} = req

  res.json(usuario)
} 

// const iniciarSesionAdmin = async(req, res) => {
//   const {correo, password} = req.body


//   try{

//     const pool = await getConnection()

//     const respuesta = await pool.request().query(`SELECT * FROM administrador where correo = '${correo}'`)


//     if(respuesta.recordset.length === 0 )
//     {
//       return res.status(400).json({
//         mensaje: 'THIS CORREO IS NOT REGISTERED',
//       })
//     }

//     const user = respuesta.recordset[0]

//     if(!user.confirmado){
//       return res.status(400).json({
//         mensaje: 'USER IS NOT CONFIRMED'
//       })
//     }

    

//     const passCompared = await bycrypt.compare(password, user.password)

//     if (!passCompared){
//       return res.status(400).json({
//         mensaje: 'PASSWORD INCORRECT'
//       })
//     }
 
//     const jwt = generarJWT(user.id)
//     const nombre = user.nombre  

//     return res.status(200).json({
//       mensaje: 'SUCCESS LOGIN',
//       nombre,
//       jwt

//     })

//   }catch(error){

//     return res.status(400).json({
//       mensaje: 'error'
//     })

//   }

// }





module.exports = {
  registrarAdministrador,
  registrarUsuario,
  iniciarSesionUsuario,
  confirmarUsuario,
  perfilUsuario

}