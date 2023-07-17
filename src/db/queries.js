
const obtenerHabitacionUsuario = `
SELECT d.*,solicitudes.renta,
    MAX(CASE WHEN rn = 1 THEN archivo.filename END) AS imagen1,
    MAX(CASE WHEN rn = 2 THEN archivo.filename END) AS imagen2
FROM deptos AS d
JOIN (
    SELECT id_habitacion, filename,
        ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY filename) AS rn
    FROM archivo
) AS archivo ON d.id = archivo.id_habitacion
JOIN solicitudes ON solicitudes.id_habitacion = d.id 
WHERE solicitudes.id_usuario = @id_usuario and solicitudes.estado = 'rentando'
GROUP BY d.id, d.descripcion, d.capacidad, d.ciudad, d.direccion, d.id_usuario, d.precio, d.estado, d.id_creador, solicitudes.renta;
`

const obtenerSolicitudes = `
  SELECT u.nombre,
  d.institucion,d.nombre_tutor,d.tel_tutor, d.telefono,d.sexo,
  s.id as solicitud_id,s.estado, deptos.direccion,s.renta,
  MIN(archivo.filename) as filename
  FROM usuario AS u inner join solicitudes AS s 
  on u.id = s.id_usuario 
  inner join datos_personales AS d
  ON d.id_usuario = u.id
  INNER JOIN deptos ON deptos.id = s.id_habitacion
  INNER JOIN archivo ON archivo.id_habitacion = deptos.id
  WHERE id_admin = @id_admin
  GROUP BY u.nombre, d.institucion, d.nombre_tutor, d.tel_tutor, d.telefono,d.sexo, s.id_habitacion, s.id, deptos.direccion,s.estado,s.renta;
  `

const historialPagos = `
  SELECT  p.id,u.nombre, p.fecha, p.id_habitacion, p.monto, d.direccion
  FROM pagos AS p 
  INNER JOIN usuario AS u ON u.id = p.id_usuario
  INNER JOIN deptos AS d ON d.id = p.id_habitacion
  WHERE p.id_admin = @id_admin
  `


module.exports = {
  obtenerHabitacionUsuario,
  obtenerSolicitudes, 
  historialPagos
}