const {getConnection} = require("../db/connection")

const obtenerUsuarios = async(req, res) => {
  
  const id = req.params.id

  try {
    const pool = await getConnection()

    const respuesta = await pool.request().query(`
    SELECT e.id,e.nombre,e.correo, e.telefono,e.nombre_tutor,e.tel_tutor,e.institucion,e.num_habitacion,e.renta_status 
    FROM estudiante as e 
    inner join administrador as a on a.id = e.admin_id 
    where a.id in (select id from administrador where id = ${id})`)

    const usuarios = respuesta.recordset

    return res.status(200).json({
      usuarios
    })
  } catch (error) {
    return res.status(400).json({
      mensage: "BAD REQUEST",
      error: error
    })
  }
}


module.exports = {
  obtenerUsuarios,

}