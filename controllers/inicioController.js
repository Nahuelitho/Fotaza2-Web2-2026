const { Publicacion, ImagenPublicacion, Etiqueta, Usuario } = require('../models/sequelize');

async function renderizarInicio(req, res) {
  const estado = req.query.estado || '';
  const error = req.query.error || '';

  const publicaciones = await Publicacion.findAll({
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
        attributes: ['nombreVisible', 'nombreUsuario'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 12,
  });

  res.render('pages/inicio', {
    title: 'Fotaza 2',
    usuarioActual: req.session.usuario || null,
    etiquetasDestacadas: ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'],
    accesosRapidos: ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'],
    mensajeEstado: estado === 'creada' ? 'Publicacion creada.' : '',
    mensajeError: error || '',
    publicaciones,
  });
}

module.exports = {
  renderizarInicio,
};
