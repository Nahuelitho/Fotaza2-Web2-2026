const { Op } = require('sequelize');
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
    mensajeExito: req.query.exito || '',
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

async function mostrarEditarPerfil(req, res) {
  const usuarioActual = req.session.usuario;
  const idUsuario = Number(req.params.id);

  if (!Number.isInteger(idUsuario)) {
    return res.redirect('/?error=Usuario invalido.');
  }

  if (Number(usuarioActual.id) !== idUsuario) {
    return res.redirect(
      redirigirPerfilConError(
        idUsuario,
        'No tenes permiso para editar este perfil.'
      )
    );
  }

  const usuarioPerfil = await Usuario.findByPk(idUsuario, {
    attributes: [
      'id',
      'nombreUsuario',
      'nombreVisible',
      'correo',
      'biografia',
    ],
  });

  if (!usuarioPerfil) {
    return res.redirect('/?error=El usuario no existe.');
  }

  return res.render('pages/editar-perfil', {
    title: 'Editar perfil | Fotaza 2',
    extraCss: ['/css/editar-perfil.css'],
    usuarioPerfil,
    mensajeError: req.query.error || '',
  });
}
async function actualizarPerfil(req, res) {
  const usuarioActual = req.session.usuario;
  const idUsuario = Number(req.params.id);

  if (!Number.isInteger(idUsuario)) {
    return res.redirect('/?error=Usuario invalido.');
  }

  if (Number(usuarioActual.id) !== idUsuario) {
    return res.redirect(
      redirigirPerfilConError(
        idUsuario,
        'No tenes permiso para editar este perfil.'
      )
    );
  }

  const nombreVisible = String(req.body.nombreVisible || '').trim();
  const nombreUsuario = String(req.body.nombreUsuario || '').trim();
  const correo = String(req.body.correo || '').trim().toLowerCase();
  const biografia = String(req.body.biografia || '').trim();

  if (!nombreVisible || !nombreUsuario || !correo) {
    return res.redirect(
      `/usuarios/${idUsuario}/editar?error=${encodeURIComponent(
        'Nombre, usuario y correo son obligatorios.'
      )}`
    );
  }

  if (!correo.includes('@')) {
    return res.redirect(
      `/usuarios/${idUsuario}/editar?error=${encodeURIComponent(
        'El correo ingresado no es valido.'
      )}`
    );
  }

  if (biografia.length > 500) {
    return res.redirect(
      `/usuarios/${idUsuario}/editar?error=${encodeURIComponent(
        'La biografia no puede superar los 500 caracteres.'
      )}`
    );
  }

  const usuarioDuplicado = await Usuario.findOne({
    where: {
      nombreUsuario,
      id: {
        [Op.ne]: idUsuario,
      },
    },
  });

  if (usuarioDuplicado) {
    return res.redirect(
      `/usuarios/${idUsuario}/editar?error=${encodeURIComponent(
        'El nombre de usuario ya esta en uso.'
      )}`
    );
  }

  const correoDuplicado = await Usuario.findOne({
    where: {
      correo,
      id: {
        [Op.ne]: idUsuario,
      },
    },
  });

  if (correoDuplicado) {
    return res.redirect(
      `/usuarios/${idUsuario}/editar?error=${encodeURIComponent(
        'El correo ya esta registrado.'
      )}`
    );
  }

  const usuario = await Usuario.findByPk(idUsuario);

  if (!usuario) {
    return res.redirect('/?error=El usuario no existe.');
  }

  await usuario.update({
    nombreVisible,
    nombreUsuario,
    correo,
    biografia,
  });

  req.session.usuario.nombreVisible = usuario.nombreVisible;
  req.session.usuario.usuario = usuario.nombreUsuario;
  req.session.usuario.correo = usuario.correo;

  return res.redirect(
    `/usuarios/${idUsuario}?exito=${encodeURIComponent(
      'Perfil actualizado correctamente.'
    )}`
  );
}
module.exports = {
  mostrarPerfilUsuario,
  mostrarEditarPerfil,
  actualizarPerfil,
  seguirUsuario,
  dejarDeSeguirUsuario,
};