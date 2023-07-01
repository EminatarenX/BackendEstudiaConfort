const {getConnection} = require("../db/connection")
const fs = require('fs')

const obtenerHabitacion = async(req, res) => {
  const {id} = req.params

  const pool = await getConnection()

  try {
    const {recordset} = await pool
    .request()
    .input('id', id)
    .query(`SELECT * FROM deptos WHERE id = @id`)

    if(recordset.length === 0){
      const error = new Error('No se encontro la habitacion')
      return res.status(404).json({msg: error.message})
    }

    
    let habitacion = recordset[0]
    
    const {recordset: imagenes} = await pool
    .request()
    .input('id', id)
    .query(`SELECT * FROM archivo WHERE id_habitacion = @id`)

    habitacion.imagenes = imagenes
    console.log(habitacion)
    res.json({habitacion})
  } catch (error) {
    console.log(error)
    return res.status(400).json({msg: 'No se pudo obtener la habitacion'})
  }
  
}

const obtenerHabitaciones = async (req, res) => {
  const pool = await getConnection();
  try {
      const { recordset } = await pool
          .request()
          .query(`SELECT deptos.*, 
          MAX(CASE WHEN rn = 1 THEN archivo.filename END) AS imagen1,
          MAX(CASE WHEN rn = 2 THEN archivo.filename END) AS imagen2
        FROM deptos
        JOIN (
          SELECT id_habitacion, filename,
            ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY filename) AS rn
          FROM archivo
        ) AS archivo ON deptos.id = archivo.id_habitacion
        GROUP BY deptos.id,deptos.descripcion,deptos.capacidad,deptos.ciudad,
        deptos.direccion,deptos.id_usuario,deptos.precio,deptos.estado,deptos.id_creador`);

      if (recordset.length === 0) {
          const error = new Error('No hay habitaciones registradas')
          return res.status(404).json({ msg: error.message })
      }

      res.json(recordset);
  } catch (error) {
      return res.status(400).json({ msg: 'No se pudo obtener las habitaciones' });

  }
}


const agregarHabitacion = async (req, res) => {
  const { descripcion, capacidad, ciudad, direccion, precio, estado } = req.body;
  const {usuario} = req
  const id_creador = usuario.id

  const pool = await getConnection();

  try {
      await pool.request()
          .input('descripcion', descripcion)
          .input('capacidad', capacidad)
          .input('ciudad', ciudad)
          .input('direccion', direccion)
          .input('precio', precio)
          .input('estado', estado)
          .input('id_creador', id_creador)
          .query(`INSERT INTO deptos (descripcion, capacidad, ciudad, direccion, precio, estado,id_creador) 
              VALUES (@descripcion, @capacidad, @ciudad, @direccion, @precio, @estado, @id_creador)`);

      const { recordset } = await pool.request()
          .input('descripcion', descripcion)
          .query(`SELECT id FROM deptos where descripcion = @descripcion`)

      const id_habitacion = recordset[0].id;
      res.json({ msg: 'Habitacion agregada correctamente', id_habitacion })

  } catch (error) {
      console.log(error)
      res.status(400).json({ msg: 'No se pudo agregar la habitacion' })
  }
}


const subirImagen = async (req, res) => {
  const { id_habitacion } = req.params;
  const { files } = req;

  if (!files) {
      const error = new Error('No se subio ningun archivo')
      return res.status(404).json({ msg: error.message })
  }

  //sacar la extension del archivo
  let imagen1 = files[0].originalname;
  let imagen2 = files[1].originalname;

  const imagensplit1 = imagen1.split('\.');
  const imagensplit2 = imagen2.split('\.');
  const extension1 = imagensplit1[1];
  const extension2 = imagensplit2[1];

  if (extension1 !== 'jpg' && extension1 !== 'png' && extension1 !== 'jpeg' || extension2 !== 'jpg' && extension2 !== 'png' && extension2 !== 'jpeg') {

      fs.unlinkSync(files[0].path)
      fs.unlinkSync(files[1].path)

      const error = new Error('Formato de archivo no valido')
      return res.status(400).json({ msg: error.message, })
  }
  try {
      const pool = await getConnection();
      await pool.request()
          .input('imagen1', files[0].filename)
          .input('id_habitacion', id_habitacion)
          .input('imagen2', files[1].filename)
          .query(`INSERT INTO archivo (filename, id_habitacion) VALUES (@imagen1,@id_habitacion),(@imagen2, @id_habitacion)`)

      return res.json({ msg: 'Imagen subida correctamente', imagen1: files[0].filename, imagen2: files[1].filename })

  } catch (error) {
      return res.status(400).json({ msg: "Hubo un error al guardar las imagenes" })
  }


}



const modificarHabitacion = async(req, res) => {

}

const eliminarHabitacion = async(req,res) => {

}

const actualizarEstado = async(req,res)=> {

}




module.exports = {
  agregarHabitacion,
  modificarHabitacion,
  eliminarHabitacion,
  obtenerHabitacion,
  obtenerHabitaciones,
  actualizarEstado,
  subirImagen
}
