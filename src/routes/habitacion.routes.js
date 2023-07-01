const expres = require('express')
const router = expres.Router()
const HabitacionController = require('../controllers/Habitaciones.controller')
const checkAuth = require('../middleware/checkAuth')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, './src/uploads/habitaciones')
    },
    filename: (req, file, cb) => {
        cb(null, "habitacion-" + Date.now()+"-" + file.originalname)
    }
})

const uploads = multer({storage})

router.post('/', checkAuth, HabitacionController.agregarHabitacion)
router.route('/:id')
.get(checkAuth,HabitacionController.obtenerHabitacion)
.put(checkAuth,HabitacionController.modificarHabitacion)
.delete(checkAuth,HabitacionController.eliminarHabitacion)
router.get('/',checkAuth,HabitacionController.obtenerHabitaciones)
router.post('/estado',checkAuth,HabitacionController.actualizarEstado)
router.post('/imagen/:id_habitacion', [checkAuth, uploads.array('habitaciones')], HabitacionController.subirImagen)

module.exports = router