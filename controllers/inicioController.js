const { Publicacion, ImagenPublicacion, Etiqueta, Usuario } = require('../models/sequelize');

async function renderizarInicio(req, res) {
  const estado = req.query.estado || '';
  const error = req.query.error || '';
  const publicacionesPorPagina = 10;
  const paginaPedida = Number(req.query.pagina) || 1;
  const paginaActual = Math.max(paginaPedida, 1);
  const offset = (paginaActual - 1) * publicacionesPorPagina;
  const mensajesEstado = {
    creada: 'La publicacion se creo correctamente.',
    eliminada: 'La publicacion fue eliminada.',
  };

  const etiquetasDisponibles = await Etiqueta.findAll({
    order: [['name', 'ASC']],
  });

  const { count, rows: publicaciones } = await Publicacion.findAndCountAll({
    where: {
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
        attributes: ['nombreVisible', 'nombreUsuario'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: publicacionesPorPagina,
    offset,
    distinct: true,
  });

  const totalPaginas = Math.max(Math.ceil(count / publicacionesPorPagina), 1);

  res.render('pages/inicio', {
    title: 'Fotaza 2',
    usuarioActual: req.session.usuario || null,
    etiquetasDestacadas: ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'],
    accesosRapidos: ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'],
    mensajeEstado: mensajesEstado[estado] || '',
    mensajeError: error || '',
    publicaciones,
    etiquetasDisponibles,
    paginacion: {
      paginaActual,
      totalPaginas,
      tieneAnterior: paginaActual > 1,
      tieneSiguiente: paginaActual < totalPaginas,
    },
  });
}

module.exports = {
  renderizarInicio,
};
