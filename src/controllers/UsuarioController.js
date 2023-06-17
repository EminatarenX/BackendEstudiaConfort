const { getConnection } = require("../db/connection");

const actualizarDatos = async (req, res) => {
  const { telefono, nombre_tutor, tel_tutor, institucion, id_usuario } =
    req.body;

  try {
    const pool = await getConnection();

    await pool.request()
      .query(`INSERT INTO datos_personales (id_usuario,telefono,nombre_tutor,tel_tutor, institucion ) 
            VALUES ('${id_usuario}', '${telefono}', '${nombre_tutor}', '${tel_tutor}', '${institucion}')`);
    return res.json({
      msg: "Los datos han sido actualizados correctamente",
      datos: { telefono, nombre_tutor, tel_tutor, institucion },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Hubo un error al actualizar lo datos" });
  }
};

const obtenerDatosPersonales = async (req, res) => {
  const { usuario } = req
  
  try {
    const pool = await getConnection();

    const { recordset } = await pool
      .request()
      .query(
        `SELECT * FROM datos_personales WHERE id_usuario = '${usuario.id}'`
      );
    
    if(recordset.length === 0){
      return res.json(usuario)
    }

    return res.json({datos: recordset[0]})

  } catch (error) {
    return res.status(400).json({msg: 'Hubo un error, Intenta mas tarde'})
  }
};

module.exports = {
  actualizarDatos,
  obtenerDatosPersonales,
};
