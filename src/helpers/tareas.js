const cron = require('node-cron')
const {getConnection} = require('../db/connection')

const iniciarTareas = () => {

    //realizar pagos por gestionar habitaciones desde la plataforma
    //como administrador de un negocio
    cron.schedule('* * * * *', async() => {
        const pool = await getConnection()
        try {
        
            const {recordset} = await pool.request()
            .query(`SELECT * FROM pagos where fecha <= GETDATE()`)            
            
            let tareas = recordset

            tareas.forEach(async tarea => {
                const {id, id_admin} = tarea

                //cambiar estado del pago

                await pool.request()
                .input('id_admin', id_admin)
                .query(`UPDATE usuario SET renta = 'pendiente' WHERE id = @id_admin`)
                    
                //eliminar tareas :v
                await pool.request()
                .input('id', id)
                .query(`DELETE FROM pagos WHERE id = @id`)
            })
        } catch (error) {
            console.log(error)
        }
    })
}

module.exports = {
    iniciarTareas
}