const { Usuario, Publicacion, ImagenPublicacion, Etiqueta, Seguimiento } = require('../models/sequelize');

function redirigirPerfilConError(idUsuario, mensaje) {
  return `/usuarios/${idUsuario}?error=${encodeURIComponent(mensaje)}`;
}

async function mostrarPerfilUsuario(req, res) {
  const usuarioActual = req.session.usuario || null;

  const usuarioPerfil = await Usuario.findByPk(req.params.id, {
    attributes: ['id', 'nombreUsuario', 'nombreVisible', 'biografia'],
  });

  if (!usuarioPerfil) {
    return res.redirect('/?error=El usuario no existe.');
  }

  const publicaciones = await Publicacion.findAll({
    where: {
      idUsuario: usuarioPerfil.id,
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
    ],
    order: [['created_at', 'DESC']],
  });

  const cantidadSeguidores = await Seguimiento.count({
    where: { idSeguido: usuarioPerfil.id },
  });

  const cantidadSeguidos = await Seguimiento.count({
    where: { idSeguidor: usuarioPerfil.id },
  });

  const esPerfilPropio =
    usuarioActual && Number(usuarioActual.id) === Number(usuarioPerfil.id);

  let yaLoSigue = false;

  if (usuarioActual && !esPerfilPropio) {
    const seguimientoExistente = await Seguimiento.findOne({
      where: {
        idSeguidor: Number(usuarioActual.id),
        idSeguido: Number(usuarioPerfil.id),
      },
    });

    yaLoSigue = Boolean(seguimientoExistente);
  }

  return res.render('pages/perfil-usuario', {
    title: `${usuarioPerfil.nombreVisible} | Fotaza 2`,
    extraCss: ['/css/perfil-usuario.css'],
    usuarioPerfil,
    publicaciones,
    yaLoSigue,
    mensajeError: req.query.error || '',
    estadisticasPerfil: {
      cantidadSeguidores,
      cantidadSeguidos,
    },
  });
}

async function seguirUsuario(req, res) {
  const usuarioActual = req.session.usuario;
  const idSeguido = Number(req.params.id);

  if (!Number.isInteger(idSeguido)) {
    return res.redirect('/?error=Usuario invalido.');
  }

  if (Number(usuarioActual.id) === idSeguido) {
    return res.redirect(redirigirPerfilConError(idSeguido, 'No podes seguirte a vos mismo.'));
  }

  const usuarioSeguido = await Usuario.findOne({
    where: {
      id: idSeguido,
      estaActivo: true,
    },
  });

  if (!usuarioSeguido) {
    return res.redirect('/?error=El usuario no existe.');
  }

  await Seguimiento.findOrCreate({
    where: {
      idSeguidor: Number(usuarioActual.id),
      idSeguido,
    },
    defaults: {
      idSeguidor: Number(usuarioActual.id),
      idSeguido,
    },
  });

  return res.redirect(`/usuarios/${idSeguido}`);
}

async function dejarDeSeguirUsuario(req, res) {
  const usuarioActual = req.session.usuario;
  const idSeguido = Number(req.params.id);

  if (!Number.isInteger(idSeguido)) {
    return res.redirect('/?error=Usuario invalido.');
  }

  await Seguimiento.destroy({
    where: {
      idSeguidor: Number(usuarioActual.id),
      idSeguido,
    },
  });

  return res.redirect(`/usuarios/${idSeguido}`);
}

module.exports = {
  mostrarPerfilUsuario,
  seguirUsuario,
  dejarDeSeguirUsuario,
};