const cron = require('node-cron')
const {getConnection} = require('../db/connection')

const iniciarTareas = () => {


    cron.schedule('* 8 * * *', async() => {
        const pool = await getConnection()
        try {
        
            const {recordset} = await pool.request()
            .query(`SELECT * FROM pagos where vencimiento <= GETDATE()`)            
            
            let tareas = recordset

            tareas.forEach(async tarea => {
                const {id, id_admin} = tarea

      

                await pool.request()
                .input('id_admin', id_admin)
                .query(`UPDATE usuario SET renta = 'pendiente' WHERE id = @id_admin`)
                    
          
             
            })
        } catch (error) {
            console.log(error)
        }
    })
}

module.exports = {
    iniciarTareas
}