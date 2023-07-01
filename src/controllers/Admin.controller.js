const { getConnection } = require('../db/connection');
const fs = require('fs');
const path = require('path');
const { uploadFile, readFile } = require('../helpers/s3');

const obtenerUsuarios = async (req, res) => {
    const { id } = req.usuario;
    const pool = await getConnection();
    try {
        const { recordset } = await pool
            .request()
            .input('id', id)
            .query(`SELECT u.id, u.nombre, u.correo, u.estado, u.renta, d.telefono, d.nombre_tutor, d.tel_tutor, d.institucion
            FROM usuario u
            JOIN datos_personales d ON d.id_usuario = u.id
            JOIN solicitudes s ON s.id_usuario = u.id AND s.id_admin = @id`);

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
            .query(`SELECT estado FROM usuario WHERE id = @id`)

        if (recordset[0].estado === 'pendiente') {
            await pool
                .request()
                .input('id', id)
                .query(`UPDATE usuario SET estado = 'rentando' where id = @id`)

        } else {
            await pool
                .request()
                .input('id', id)
                .query(`UPDATE usuario SET estado = 'pendiente' where id = @id`)

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
            .input('id', id)
            .query(`DELETE FROM datos_personales WHERE id_usuario = @id`)
        res.json({ msg: 'Solicitud eliminada correctamente' })
    } catch (error) {
        res.status(400).json({ msg: 'No se pudo eliminar la solicitud' })
    }

}





module.exports = {
    obtenerUsuarios,
    cambiarEstado,
    eliminarSolicitud,

}