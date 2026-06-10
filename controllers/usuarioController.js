const { Usuario, Publicacion, ImagenPublicacion, Etiqueta, Seguimiento } = require('../models/sequelize');

async function mostrarPerfilUsuario(req, res) {
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

  return res.render('pages/perfil-usuario', {
    title: `${usuarioPerfil.nombreVisible} | Fotaza 2`,
    extraCss: ['/css/perfil-usuario.css'],
    usuarioPerfil,
    publicaciones,
    estadisticasPerfil: {
      cantidadSeguidores,
      cantidadSeguidos,
    },
  });
}

module.exports = {
  mostrarPerfilUsuario,
};
