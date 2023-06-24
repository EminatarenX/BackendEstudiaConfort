const expres = require('express')
const router = expres.Router()
const HabitacionController = require('../controllers/Habitaciones.controller')
const checkAuth = require('../middleware/checkAuth')

router.post('/',checkAuth,HabitacionController.agregarHabitacion)
router
.route('/:id')
.get(checkAuth,HabitacionController.obtenerHabitacion)
.put(checkAuth,HabitacionController.modificarHabitacion)
.delete(checkAuth,HabitacionController.eliminarHabitacion)

router.post('/estado/:id', checkAuth)

module.exports = router