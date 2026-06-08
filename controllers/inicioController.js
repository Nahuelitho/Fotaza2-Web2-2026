const { Op } = require('sequelize');
const { Publicacion, ImagenPublicacion, Etiqueta, Usuario } = require('../models/sequelize');

function armarUrlPagina(pagina, filtros) {
  const params = new URLSearchParams();

  if (filtros.buscar) {
    params.set('buscar', filtros.buscar);
  }

  if (filtros.etiqueta) {
    params.set('etiqueta', filtros.etiqueta);
  }

  params.set('pagina', pagina);

  return `/?${params.toString()}`;
}

async function renderizarInicio(req, res) {
  const estado = req.query.estado || '';
  const error = req.query.error || '';
  const buscar = req.query.buscar?.trim() || '';
  const etiqueta = req.query.etiqueta?.trim() || '';
  const publicacionesPorPagina = 10;
  const paginaPedida = Number(req.query.pagina) || 1;
  const paginaActual = Math.max(paginaPedida, 1);
  const offset = (paginaActual - 1) * publicacionesPorPagina;
  const filtrosBusqueda = { buscar, etiqueta };
  const mensajesEstado = {
    creada: 'La publicacion se creo correctamente.',
    eliminada: 'La publicacion fue eliminada.',
  };

  const wherePublicacion = {
    visibilidad: 'publica',
    estado: 'activa',
  };

  if (buscar) {
    wherePublicacion[Op.or] = [
      { titulo: { [Op.iLike]: `%${buscar}%` } },
      { descripcion: { [Op.iLike]: `%${buscar}%` } },
      { '$etiquetas.name$': { [Op.iLike]: `%${buscar}%` } },
    ];
  }

  const { count, rows: publicaciones } = await Publicacion.findAndCountAll({
    where: wherePublicacion,
    include: [
      {
        model: ImagenPublicacion,
        as: 'imagenes',
      },
      {
        model: Etiqueta,
        as: 'etiquetas',
        through: { attributes: [] },
        ...(etiqueta ? { where: { name: etiqueta } } : {}),
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
    subQuery: false,
  });

  const totalPaginas = Math.max(Math.ceil(count / publicacionesPorPagina), 1);

  res.render('pages/inicio', {
    title: 'Fotaza 2',
    mensajeEstado: mensajesEstado[estado] || '',
    mensajeError: error || '',
    publicaciones,
    paginacion: {
      paginaActual,
      totalPaginas,
      tieneAnterior: paginaActual > 1,
      tieneSiguiente: paginaActual < totalPaginas,
      urlAnterior: armarUrlPagina(paginaActual - 1, filtrosBusqueda),
      urlSiguiente: armarUrlPagina(paginaActual + 1, filtrosBusqueda),
    },
  });
}

module.exports = {
  renderizarInicio,
};
