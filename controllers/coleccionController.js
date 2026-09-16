const {
  Coleccion,
  ColeccionPublicacion,
  Publicacion,
  ImagenPublicacion,
  Etiqueta,
  Usuario,
} = require('../models/sequelize');

async function mostrarColecciones(req, res) {
  const colecciones = await Coleccion.findAll({
    where: {
      idUsuario: Number(req.session.usuario.id),
    },
    include: [
      {
        model: Publicacion,
        as: 'publicaciones',
        attributes: ['id'],
        through: { attributes: [] },
        where: {
          visibilidad: 'publica',
          estado: 'activa',
        },
        required: false,
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return res.render('pages/colecciones', {
    title: 'Mis colecciones | Fotaza 2',
    extraCss: ['/css/colecciones.css'],
    colecciones,
    mensajeError: req.query.error || '',
    mensajeExito: req.query.exito || '',
  });
}

async function crearColeccion(req, res) {
  const nombre = String(req.body.nombre || '').trim();
  const idUsuario = Number(req.session.usuario.id);

  if (!nombre) {
    return res.redirect('/colecciones?error=Ingresa un nombre para la coleccion.');
  }

  if (nombre.length > 80) {
    return res.redirect('/colecciones?error=El nombre no puede superar los 80 caracteres.');
  }

  const [, creada] = await Coleccion.findOrCreate({
    where: {
      idUsuario,
      nombre,
    },
    defaults: {
      idUsuario,
      nombre,
    },
  });

  const mensaje = creada
    ? 'Coleccion creada correctamente.'
    : 'Ya existe una coleccion con ese nombre.';
  const tipoMensaje = creada ? 'exito' : 'error';

  return res.redirect(
    `/colecciones?${tipoMensaje}=${encodeURIComponent(mensaje)}`
  );
}

async function mostrarColeccion(req, res) {
  const idColeccion = Number(req.params.id);

  if (!Number.isInteger(idColeccion)) {
    return res.redirect('/colecciones?error=Coleccion invalida.');
  }

  const coleccion = await Coleccion.findOne({
    where: {
      id: idColeccion,
      idUsuario: Number(req.session.usuario.id),
    },
    include: [
      {
        model: Publicacion,
        as: 'publicaciones',
        through: { attributes: [] },
        where: {
          visibilidad: 'publica',
          estado: 'activa',
        },
        required: false,
        include: [
          {
            model: ImagenPublicacion,
            as: 'imagenes',
          },
          {
            model: Etiqueta,
            as: 'etiquetas',
            through: { attributes: [] },
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombreVisible', 'nombreUsuario'],
          },
        ],
      },
    ],
  });

  if (!coleccion) {
    return res.redirect('/colecciones?error=La coleccion no existe.');
  }

  return res.render('pages/coleccion-detalle', {
    title: `${coleccion.nombre} | Fotaza 2`,
    extraCss: ['/css/colecciones.css'],
    coleccion,
    mensajeError: req.query.error || '',
    mensajeExito: req.query.exito || '',
  });
}

async function agregarPublicacion(req, res) {
  const idPublicacion = Number(req.params.publicacionId);
  const idColeccion = Number(req.body.idColeccion);
  const idUsuario = Number(req.session.usuario.id);

  if (!Number.isInteger(idPublicacion) || !Number.isInteger(idColeccion)) {
    return res.redirect('/colecciones?error=Los datos indicados no son validos.');
  }

  const [coleccion, publicacion] = await Promise.all([
    Coleccion.findOne({ where: { id: idColeccion, idUsuario } }),
    Publicacion.findOne({
      where: {
        id: idPublicacion,
        visibilidad: 'publica',
        estado: 'activa',
      },
    }),
  ]);

  if (!coleccion || !publicacion) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'La publicacion o la coleccion no esta disponible.'
      )}`
    );
  }

  const [, agregada] = await ColeccionPublicacion.findOrCreate({
    where: {
      idColeccion,
      idPublicacion,
    },
    defaults: {
      idColeccion,
      idPublicacion,
    },
  });

  const mensaje = agregada
    ? `Publicacion agregada a ${coleccion.nombre}.`
    : `La publicacion ya esta en ${coleccion.nombre}.`;

  return res.redirect(
    `/publicaciones/${idPublicacion}?exito=${encodeURIComponent(mensaje)}`
  );
}

async function quitarPublicacion(req, res) {
  const idColeccion = Number(req.params.id);
  const idPublicacion = Number(req.params.publicacionId);
  const idUsuario = Number(req.session.usuario.id);

  if (!Number.isInteger(idColeccion) || !Number.isInteger(idPublicacion)) {
    return res.redirect('/colecciones?error=Los datos indicados no son validos.');
  }

  const coleccion = await Coleccion.findOne({
    where: {
      id: idColeccion,
      idUsuario,
    },
  });

  if (!coleccion) {
    return res.redirect('/colecciones?error=La coleccion no existe.');
  }

  await ColeccionPublicacion.destroy({
    where: {
      idColeccion,
      idPublicacion,
    },
  });

  return res.redirect(
    `/colecciones/${idColeccion}?exito=${encodeURIComponent(
      'Publicacion quitada de la coleccion.'
    )}`
  );
}

module.exports = {
  mostrarColecciones,
  crearColeccion,
  mostrarColeccion,
  agregarPublicacion,
  quitarPublicacion,
};
