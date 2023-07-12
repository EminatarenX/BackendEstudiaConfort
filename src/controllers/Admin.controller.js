const { getConnection } = require('../db/connection');
const { obtenerSolicitudes } = require('../db/queries')
const stripe = require('stripe')('sk_test_51NOtkQJRIprVyB9KFM0LOWd3hO3xocFp5xYeqGRLluV25UqaQPkBDlse65F7Alo4SnXGzXMt4DfM3I3teAxZl2ve005WzooTLI')
const mssql = require('mssql')
const fs = require('fs')

const obtenerUsuarios = async (req, res) => {
    const { id } = req.usuario;
    const pool = await getConnection();
    try {
        const { recordset } = await pool.request().input('id_admin', id).query(obtenerSolicitudes)

        res.json(recordset);
    } catch (error) {
        return res.status(400).json({ msg: 'No se pudo obtener los usuarios' });

    }
}

const cambiarEstado = async (req, res) => {
    const { id } = req.body;
   
    const pool = await getConnection();

    try {
        const { recordset } = await pool.request()
            .input('id', id)
            .query(`SELECT estado FROm solicitudes WHERE id = @id`)

        if (recordset[0].estado === 'pendiente') {
            await pool
                .request()
                .input('id', id)
                .query(`
                    UPDATE solicitudes SET estado = 'rentando' where id = @id
                    UPDATE deptos SET id_usuario = (SELECT id_usuario FROM solicitudes WHERE id = @id), estado = 'ocupado' where id = (SELECT id_habitacion FROM solicitudes WHERE id = @id)

                    `)

        } else {
            await pool
                .request()
                .input('id', id)
                .query(`
                    UPDATE solicitudes SET estado = 'pendiente', renta = 'pendiente' where id = @id
                    UPDATE deptos SET id_usuario = NULL, estado = 'disponible' where id = (SELECT id_habitacion FROM solicitudes WHERE id = @id)
                `)

        }
        res.json({ msg: 'Estado actualizado' })

    } catch (error) {
        res.status(400).json({ msg: 'No se pudo actualizar el estado' })
        console.log(error)
    }   

}

const eliminarSolicitud = async (req, res) => {

    const { id } = req.params;
    const pool = await getConnection();

    try {
        await pool.request()
            .input('id',mssql.UniqueIdentifier, id)
            .query(`DELETE FROM solicitudes WHERE id = @id`)
        res.json({ msg: 'Solicitud eliminada correctamente' })
    } catch (error) {

        res.status(400).json({ msg: 'No se pudo eliminar la solicitud' })
    }

}


const obtenerHabitaciones = async (req, res) => {
    const { id } = req.usuario;
    const pool = await getConnection();
    try {   

        const { recordset } = await pool
            .request()
            .input('id_creador', id)
            .query(`
                SELECT deptos.*, 
          MAX(CASE WHEN rn = 1 THEN archivo.filename END) AS imagen1,
          MAX(CASE WHEN rn = 2 THEN archivo.filename END) AS imagen2
        FROM deptos
        JOIN (
          SELECT id_habitacion, filename,
            ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY filename) AS rn
          FROM archivo
        ) AS archivo ON deptos.id = archivo.id_habitacion
		where deptos.id_creador = @id_creador
        GROUP BY deptos.id,deptos.descripcion,deptos.capacidad,deptos.ciudad,
        deptos.direccion,deptos.id_usuario,deptos.precio,deptos.estado,deptos.id_creador	
            `)

        return res.json(recordset)
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: 'No se pudo obtener las habitaciones' })
    }
}

const pagarServicio = async (req, res) => {
    const { usuario } = req
    const { descripcion, monto, fecha } = req.body
    const pool = await getConnection();
    console.log(req.body)
    try {
        // // Crea un token a partir de los datos de la tarjeta
        // const token = await stripe.tokens.create({  
        //     card: {
        //         number: numero,
        //         exp_month: exp_mes,
        //         exp_year: exp_anio,
        //         cvc,
        //     },
        // });

        // // Crea un nuevo PaymentIntent
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: monto,
        //     currency: 'usd',
        //     payment_method_types: ['card'],
        //     payment_method_data: {
        //         type: 'card',
        //         card: {
        //             token: token.id, // Utiliza el token creado anteriormente
        //         },
        //     },
        // });



        // console.log(paymentIntent)

        // // Completa el pago
        // const confirtm = await stripe.paymentIntents.confirm(paymentIntent.id);

        // //  El pago se completó exitosamente
        // console.log(confirtm)
        // return res.json({ msg: 'Pago realizado correctamente' })
        //   actualizar estado de pago
        await pool.request()
            .input('id_admin', usuario.id)
            .query(`UPDATE usuario SET renta = 'pagado' WHERE id = @id_admin`)


        await pool.request()
            .input('id_admin', usuario.id)
            .input('monto', monto)
            .input('descripcion', descripcion)
            .input('fecha', fecha)
            .query(`INSERT INTO pagos (monto, descripcion, fecha, id_admin) VALUES (@monto, @descripcion, @fecha, @id_admin)`)
        
        
        return res.json({ msg: 'Pago realizado correctamente' })
    } catch (error) {
        console.log(error)
    }

}

const modificarPago = async(req, res) => {
    const { id } = req.params
    const { renta } = req.body

    const pool = await getConnection();

    try {
        if(renta === 'pagado'){
            await pool.request()
            .input('id', id)
            .query(`UPDATE solicitudes set renta = 'pendiente' WHERE id = @id`)
        }else{
            await pool.request()
            .input('id', id)
            .query(`UPDATE solicitudes set renta = 'pagado' WHERE id = @id`)
        }


       

        res.json({msg: 'Pago realizado correctamente'})

    } catch (error) {
        res.status(400).json({msg: 'No se pudo realizar el pago'})
    }

}




module.exports = {
    obtenerUsuarios,
    cambiarEstado,
    eliminarSolicitud,
    obtenerHabitaciones,
    pagarServicio,
    modificarPago
}