const { Post, PostImage, Tag, User } = require('../models/sequelize');

async function renderizarInicio(req, res) {
  const estado = req.query.estado || '';
  const error = req.query.error || '';

  const posts = await Post.findAll({
    include: [
      {
        model: PostImage,
      },
      {
        model: Tag,
        through: { attributes: [] },
      },
      {
        model: User,
        attributes: ['displayName', 'username'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: 12,
  });

  res.render('pages/home', {
    title: 'Fotaza 2',
    usuarioActual: req.session.user || null,
    etiquetasDestacadas: ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'],
    accesosRapidos: ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'],
    mensajeEstado: estado === 'creada' ? 'Publicacion creada.' : '',
    mensajeError: error || '',
    posts,
  });
}

module.exports = {
  renderizarInicio,
};
