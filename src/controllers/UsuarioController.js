const { connect } = require("mssql");
const { getConnection } = require("../db/connection");
const { obtenerHabitacionUsuario } = require('../db/queries')
const Stripe = require('stripe')
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const actualizarDatos = async (req, res) => {
  const { telefono, nombre_tutor, tel_tutor, institucion, sexo } = req.body;


  const pool = await getConnection();
  try {
    const { recordset } = await pool.request().query(`SELECT * FROM datos_personales WHERE id_usuario = '${req.usuario.id}'`);
    if(recordset.length !== 0){
      const error = new Error('Ya has actualizado tus datos personales')
      return res.status(400).json({msg: error.message})
    }
    

    await pool.request().query(`INSERT INTO datos_personales (id_usuario, telefono, nombre_tutor, tel_tutor, institucion, sexo) VALUES ('${req.usuario.id}','${telefono}', '${nombre_tutor}', '${tel_tutor}', '${institucion}', '${sexo}')`)
    
    return res.json({msg: 'Datos actualizados correctamente',telefono, nombre_tutor, tel_tutor, institucion, sexo})
  } catch (error) {
    
    res.status(400).json({msg: "Hubo un error, intenta mas tarde"})
  }


};



const obtenerDatosPersonales = async (req, res) => {
 const {id} = req.usuario
 

  const pool = await getConnection();
  try {
    const { recordset } = await pool.request().query(`SELECT * FROM datos_personales WHERE id_usuario = '${id}'`);
    if(recordset.length === 0){
      const error = new Error('No has actualizado tus datos personales')
      return res.status(400).json({msg: error.message})
    }
    return res.json(recordset[0])
    
  } catch (error) {
    return res.status(400).json({msg: "No se pudo obtener los datos personales"})
  }

};

const mandarSolicitud = async (req, res) => {
  const { id } = req.usuario
  const { id_creador, id_habitacion } = req.body

  const pool = await getConnection();

  try {
    const {recordset} = await pool.request()
    .input('id_usuario', id)
    .input('id_admin', id_creador)
    .input('id_habitacion', id_habitacion)
    .query(`SELECT * FROM solicitudes WHERE id_usuario = @id_usuario AND id_admin = @id_admin and id_habitacion = @id_habitacion`)

    if(recordset.length !== 0){
      const error = new Error('Ya has enviado una solicitud para esta habitacion')
      return res.status(400).json({msg: error.message})
    }

    await pool.request()
    .input('id_usuario', id)
    .input('id_admin', id_creador)
    .input('id_habitacion', id_habitacion)
    .query(`INSERT INTO solicitudes (id_usuario, id_admin, id_habitacion) VALUES (@id_usuario, @id_admin, @id_habitacion)`)

    return res.json({msg: 'Solicitud enviada correctamente'})
  } catch (error) {
    return res.status(400).json({msg: "No se pudo enviar la solicitud"})
  }

}

const obtenerHabitacion = async(req, res) => {
  const {id} = req.usuario
  const pool = await getConnection();

  try {
    const {recordset} = await pool.request()
    .input('id_usuario', id)
    .query(obtenerHabitacionUsuario)

    if(recordset.length === 0){
      const error = new Error('No tienes una habitacion en renta')
      return res.status(400).json({msg: error.message})
    }

    return res.json(recordset[0])

  } catch (error) {
    return res.status(400).json({msg: "No se pudo obtener la habitacion"})
  }
}

const pagarHabitacion = async(req, res) => {
  const {id, amount, id_creador} = req.body
  const {id: id_usuario} = req.usuario
  const {id_habitacion} = req.params
  
 
  
  const pool = await getConnection();
  
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      description: 'Pago de renta de habitacion',
      payment_method: id,
      confirm: true
    })

    let monto = amount / 100

    let vencimiento = new Date();
    vencimiento.setMonth(vencimiento.getMonth() + 1);

    await pool.request()
    .input('id_usuario', id_usuario)
    .input('id_habitacion', id_habitacion)
    .input('monto',monto)
    .input('id_creador', id_creador)
    .input('vencimiento', vencimiento)
    .query(`
      INSERT INTO pagos (monto, descripcion, id_habitacion, id_admin, id_usuario, vencimiento) 
      VALUES (@monto, 'Pago de renta de habitacion', @id_habitacion, @id_creador, @id_usuario, CONVERT(DATETIME, @vencimiento) );
`)
    await pool.request()
    .input('id_usuario', id_usuario)
    .input('id_habitacion', id_habitacion)
    .query(`
       UPDATE solicitudes SET renta = 'pagado' WHERE id_usuario = @id_usuario AND id_habitacion = @id_habitacion
    `)

    return res.json({msg: 'Pago realizado correctamente'})
  } catch (error) {

    return res.status(400).json({msg: 'No se pudo realizar el pago'})
   
  }

}

module.exports = {
  actualizarDatos,
  obtenerDatosPersonales,
  mandarSolicitud,
  obtenerHabitacion,
  pagarHabitacion
};
