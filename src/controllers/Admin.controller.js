const { getConnection } = require('../db/connection');
const { obtenerSolicitudes, historialPagos } = require('../db/queries')

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
          MAX(CASE WHEN rn = 1 THEN archivo.pathname END) AS imagen1,
          MAX(CASE WHEN rn = 2 THEN archivo.pathname END) AS imagen2
        FROM deptos
        JOIN (
          SELECT id_habitacion, pathname,
            ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY pathname) AS rn
          FROM archivo
        ) AS archivo ON deptos.id = archivo.id_habitacion
		where deptos.id_creador = @id_creador
        GROUP BY deptos.id,deptos.descripcion,deptos.capacidad,deptos.ciudad,
        deptos.direccion,deptos.id_usuario,deptos.precio,deptos.estado,deptos.id_creador	
            `)

        return res.json(recordset)
    } catch (error) {
   
        res.status(400).json({ msg: 'No se pudo obtener las habitaciones' })
    }
}

const pagarServicio = async (req, res) => {

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


const historial = async (req, res) => {
    const pool = await getConnection();
    const {usuario} = req;

    try {
        const {recordset} = await pool
        .request().input('id_admin', usuario.id).query(historialPagos)

        if(recordset.length === 0)
        {
            const error = new Error('No hay ningun registro')
            return res.status(400).json({msg: error.message})
        }

        return res.json(recordset)
    } catch (error) {
        return res.status(400).json({msg: 'No se pudo obtener el historial'})
    }
}



module.exports = {
    obtenerUsuarios,
    cambiarEstado,
    eliminarSolicitud,
    obtenerHabitaciones,
    pagarServicio,
    modificarPago,
    historial
}