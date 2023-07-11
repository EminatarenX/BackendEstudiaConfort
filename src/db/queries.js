
const crearTablaTemporal = `
WITH cte AS (
    SELECT
      id_habitacion,
      filename,
      ROW_NUMBER() OVER (PARTITION BY id_habitacion ORDER BY filename) AS rn
    FROM archivo
  )
  SELECT
    c1.id_habitacion,
    c1.filename AS imagen1,
    c2.filename AS imagen2
  INTO imagenes -- Nombre de la nueva tabla
  FROM cte c1
  LEFT JOIN cte c2 ON c1.id_habitacion = c2.id_habitacion AND c2.rn = 2
  WHERE c1.rn = 1;`

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


  module.exports = {
    crearTablaTemporal,
    obtenerSolicitudes
  }