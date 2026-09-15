const { Op } = require('sequelize');
const {
  Favorito,
  Publicacion,
  ImagenPublicacion,
  Etiqueta,
  Usuario,
} = require('../models/sequelize');

async function agregarFavorito(req, res) {
  const idPublicacion = Number(req.params.id);
  const idUsuario = Number(req.session.usuario.id);

  if (!Number.isInteger(idPublicacion)) {
    return res.redirect('/?error=Publicacion invalida.');
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: idPublicacion,
      visibilidad: 'publica',
      estado: 'activa',
    },
  });

  if (!publicacion) {
    return res.redirect('/?error=La publicacion no esta disponible.');
  }

  if (Number(publicacion.idUsuario) === idUsuario) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'No podes guardar tu propia publicacion como favorita.'
      )}`
    );
  }

  await Favorito.findOrCreate({
    where: {
      idUsuario,
      idPublicacion,
    },
    defaults: {
      idUsuario,
      idPublicacion,
    },
  });

  return res.redirect(
    `/publicaciones/${idPublicacion}?exito=${encodeURIComponent(
      'Publicacion agregada a favoritos.'
    )}`
  );
}

async function quitarFavorito(req, res) {
  const idPublicacion = Number(req.params.id);
  const idUsuario = Number(req.session.usuario.id);

  if (!Number.isInteger(idPublicacion)) {
    return res.redirect('/favoritos?error=Publicacion invalida.');
  }

  await Favorito.destroy({
    where: {
      idUsuario,
      idPublicacion,
    },
  });

  const volverAFavoritos = req.body.origen === 'favoritos';

  if (volverAFavoritos) {
    return res.redirect('/favoritos?exito=Publicacion eliminada de favoritos.');
  }

  return res.redirect(
    `/publicaciones/${idPublicacion}?exito=${encodeURIComponent(
      'Publicacion eliminada de favoritos.'
    )}`
  );
}

async function mostrarFavoritos(req, res) {
  const favoritos = await Favorito.findAll({
    where: {
      idUsuario: Number(req.session.usuario.id),
    },
    attributes: ['idPublicacion'],
    order: [['created_at', 'DESC']],
    raw: true,
  });
  const idsPublicaciones = favoritos.map((favorito) => favorito.idPublicacion);

  const publicaciones = idsPublicaciones.length
    ? await Publicacion.findAll({
        where: {
          id: { [Op.in]: idsPublicaciones },
          visibilidad: 'publica',
          estado: 'activa',
        },
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
      })
    : [];

  publicaciones.sort(
    (a, b) => idsPublicaciones.indexOf(a.id) - idsPublicaciones.indexOf(b.id)
  );

  return res.render('pages/favoritos', {
    title: 'Mis favoritos | Fotaza 2',
    publicaciones,
    mensajeError: req.query.error || '',
    mensajeExito: req.query.exito || '',
  });
}

module.exports = {
  agregarFavorito,
  quitarFavorito,
  mostrarFavoritos,
};
