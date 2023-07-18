const { getConnection } = require("../db/connection")
const fs = require('fs')

const obtenerHabitacion = async (req, res) => {
  const { id } = req.params

  const pool = await getConnection()

  try {
    const { recordset } = await pool
      .request()
      .input('id', id)
      .query(`SELECT * FROM deptos WHERE id = @id`)

    if (recordset.length === 0) {
      const error = new Error('No se encontro la habitacion')
      return res.status(404).json({ msg: error.message })
    }


    let habitacion = recordset[0]

    const { recordset: imagenes } = await pool
      .request()
      .input('id', id)
      .query(`SELECT * FROM archivo WHERE id_habitacion = @id`)

    habitacion.imagenes = imagenes

    res.json({ habitacion })
  } catch (error) {
    // console.log(error)
    return res.status(400).json({ msg: 'No se pudo obtener la habitacion' })
  }

}

const obtenerHabitaciones = async (req, res) => {
  const pool = await getConnection();
  try {
    const { recordset } = await pool
      .request()
      .query(`SELECT deptos.*, 
          MAX(CASE WHEN rn = 1 THEN archivo.pathname END) AS imagen1,
          MAX(CASE WHEN rn = 2 THEN archivo.pathname END) AS imagen2
        FROM deptos
        JOIN (
          SELECT id_habitacion, pathname,
            ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY pathname) AS rn
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
  const { usuario } = req
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

  if (!files || files[0] === undefined) {
    fs.unlinkSync(files[1].path)
    const error = new Error('No se subio ningun archivo')
    return res.status(404).json({ msg: error.message })
  } else if (files[1] === undefined) {
    fs.unlinkSync(files[0].path)
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
      .input('path1', files[0].path)
      .input('path2', files[1].path)
      .query(`INSERT INTO archivo (filename, id_habitacion, pathname) VALUES (@imagen1,@id_habitacion, @path1),(@imagen2, @id_habitacion, @path2)`)

    return res.json({ msg: 'Imagen subida correctamente', imagen1: files[0].filename, imagen2: files[1].filename })

  } catch (error) {
    fs.unlinkSync(files[0].path)
    fs.unlinkSync(files[1].path)
    return res.status(400).json({ msg: "Hubo un error al guardar las imagenes" })
  }


}



const modificarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { descripcion, capacidad, ciudad, direccion, precio, estado } = req.body;


  const pool = await getConnection();


  try {
    await pool.request()
      .input('descripcion', descripcion)
      .input('capacidad', capacidad)
      .input('ciudad', ciudad)
      .input('direccion', direccion)
      .input('precio', precio)
      .input('estado', estado)
      .input('id', id)
      .query(`UPDATE deptos SET descripcion = @descripcion, capacidad = @capacidad, ciudad = @ciudad, direccion = @direccion, precio = @precio, estado = @estado WHERE id = @id`);

    const { recordset } = await pool.request().input('id', id).query(`SELECT * FROM deptos WHERE id = @id`)
    const habitacion = recordset[0]
    res.json({ msg: 'Habitacion modificada correctamente', habitacion })

  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: 'No se pudo modificar la habitacion' })
  }
}

const eliminarHabitacion = async (req, res) => {
  const { id } = req.params
  const {public_id: url1, public_id2: url2} = req.body

  try {

  const parts1 = url1.split('/');
  const parts2 = url2.split('/');

  const filename1 = parts1[parts1.length - 1];
  const filename2 = parts2[parts2.length - 1];

  const public_id = filename1.split('.')[0];
  const public_id2 = filename2.split('.')[0];

  await cloudinary.uploader.destroy(public_id);
  await cloudinary.uploader.destroy(public_id2);

  
  const pool = await getConnection()
 
    // Ejecutar las consultas DELETE
    await pool.request().input('id', id).query(`
    DELETE FROM archivo WHERE id_habitacion = @id
    DELETE FROM solicitudes WHERE id_habitacion = @id
    DELETE FROM deptos WHERE id = @id
    `);

    res.json({ msg: 'Habitacion eliminada correctamente' })
  } catch (error) {
    res.status(400).json({ msg: 'No se pudo eliminar la habitacion' })
  }
}

const actualizarEstado = async (req, res) => {
  const { id } = req.body
  const pool = await getConnection()
  try {
    const { recordset } = await pool.request().input('id', id).query(`SELECT estado FROM deptos WHERE id = @id`)
    const estado = recordset[0].estado
    if (estado === 'disponible') {
      await pool.request().input('id', id).query(`UPDATE deptos SET estado = 'ocupado' WHERE id = @id`)
    } else {
      await pool.request().input('id', id).query(`UPDATE deptos SET estado = 'disponible' WHERE id = @id`)
    }
    res.json({ msg: 'Estado actualizado correctamente' })
  } catch (error) {
    res.status(400).json({ msg: 'No se pudo actualizar el estado' })
  }
}

const getIndex = async (req, res) => {
  const pool = await getConnection()

  try {
    const { recordset } = await pool.request().query(`
      SELECT TOP 6 d.id, d.ciudad,
      MAX(CASE WHEN rn = 1 THEN archivo.filename END) AS imagen1
      from deptos as d
      inner join(SELECT id_habitacion, filename,
      ROW_NUMBER() OVER(PARTITION BY id_habitacion ORDER BY filename) AS rn
      from archivo)
      AS archivo on d.id = archivo.id_habitacion
      group by d.id, d.ciudad
    `)

    res.json(recordset)

  } catch (error) {

    return res.status(400).json({ msg: 'No se pudo obtener las habitaciones', error })

  }
}

const cloudinary = require('cloudinary').v2;
const subirImagenC = async (req, res) => {
  const { id_habitacion } = req.params;
  const { files } = req;
  const imageUrls = [];

  // Iterar sobre los archivos cargados

  try {
    for (const file of req.files) {
      // Subir el archivo a Cloudinary
      const result = await cloudinary.uploader.upload(file.path);

      // Guardar la URL del archivo en el arreglo
      imageUrls.push(result.secure_url);
    }

    const pool = await getConnection();

    await pool.request()
    .input('imagen1', files[0].filename)
    .input('id_habitacion', id_habitacion)
    .input('imagen2', files[1].filename)
    .input('path1', imageUrls[0])
    .input('path2', imageUrls[1])
    .query(`INSERT INTO archivo (filename, id_habitacion, pathname) VALUES (@imagen1,@id_habitacion, @path1),(@imagen2, @id_habitacion, @path2)`)


    return res.json({ msg: 'Imagen subida correctamente', imagen1: imageUrls[0], imagen2: imageUrls[1] })
     
  } catch (error) {
    console.log(error)
  }



}



module.exports = {
  agregarHabitacion,
  modificarHabitacion,
  eliminarHabitacion,
  obtenerHabitacion,
  obtenerHabitaciones,
  actualizarEstado,
  subirImagen,
  subirImagenC,
  getIndex
}
