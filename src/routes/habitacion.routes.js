const expres = require('express')
const router = expres.Router()
const HabitacionController = require('../controllers/Habitaciones.controller')
const checkAuth = require('../middleware/checkAuth')
const multer = require('multer')

//prueba de cloudinary
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento de Multer
const almacenamiento = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'EstudiaConfort',
    allowed_formats: ['jpeg', 'png', 'jpg']
  }
});

// Inicialización de Multer
const upload = multer({ storage: almacenamiento });





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
router.post('/imagenc/:id_habitacion', [checkAuth, upload.array('habitaciones', 2)], HabitacionController.subirImagenC)


module.exports = router