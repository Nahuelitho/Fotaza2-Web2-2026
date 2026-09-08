const {
  DenunciaPublicacion,
  Publicacion,
  Usuario,
  ImagenPublicacion,
} = require('../models/sequelize');

async function mostrarPanelDenuncias(req, res) {
  const publicaciones = await Publicacion.findAll({
    where: {
      estado: 'en_revision',
    },
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombreUsuario', 'nombreVisible'],
      },
      {
        model: ImagenPublicacion,
        as: 'imagenes',
      },
      {
        model: DenunciaPublicacion,
        as: 'denuncias',
        where: {
          estado: 'pendiente',
        },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombreUsuario', 'nombreVisible'],
          },
        ],
      },
    ],
    order: [['updated_at', 'DESC']],
  });

  return res.render('pages/validador-denuncias', {
    title: 'Panel validador | Fotaza 2',
    extraCss: ['/css/validador.css'],
    publicaciones,
    mensajeError: req.query.error || '',
    mensajeExito: req.query.exito || '',
  });
}

module.exports = {
  mostrarPanelDenuncias,
};