const { Op, QueryTypes } = require("sequelize");
const {
  sequelize,
  Publicacion,
  ImagenPublicacion,
  Etiqueta,
  Usuario,
} = require("../models/sequelize");

function armarUrlPagina(pagina, filtros) {
  const params = new URLSearchParams();

  if (filtros.buscar) {
    params.set("buscar", filtros.buscar);
  }

  if (filtros.etiqueta) {
    params.set("etiqueta", filtros.etiqueta);
  }

  params.set("pagina", pagina);

  return `/?${params.toString()}`;
}

async function renderizarInicio(req, res) {
  const estado = req.query.estado || "";
  const error = req.query.error || "";
  const buscar = req.query.buscar?.trim() || "";
  const etiqueta = req.query.etiqueta?.trim() || "";
  const publicacionesPorPagina = 6;
  const paginaPedida = Number(req.query.pagina) || 1;
  const paginaActual = Math.max(paginaPedida, 1);
  const offset = (paginaActual - 1) * publicacionesPorPagina;
  const filtrosBusqueda = { buscar, etiqueta };
  const mensajesEstado = {
    creada: "La publicacion se creo correctamente.",
    eliminada: "La publicacion fue eliminada.",
    en_revision: "La publicacion paso a revision por tener 3 denuncias.",
  };

  const wherePublicacion = {
    visibilidad: "publica",
    estado: "activa",
  };
  const usuarioActual = res.locals.usuarioActual || null;

  const condicionesSql = [
    "p.visibilidad = 'publica'",
    "p.estado = 'activa'",
  ];
  const replacements = {
    limit: publicacionesPorPagina,
    offset,
  };

  if (!usuarioActual) {
    condicionesSql.push(`EXISTS (
      SELECT 1
      FROM imagenes_publicacion ip
      WHERE ip.id_publicacion = p.id
        AND ip.tipo_licencia = 'creative_commons'
    )`);
  }

  if (etiqueta) {
    condicionesSql.push(`EXISTS (
      SELECT 1
      FROM publicaciones_etiquetas pe
      INNER JOIN etiquetas e ON e.id = pe.id_etiqueta
      WHERE pe.id_publicacion = p.id
        AND e.name = :etiqueta
    )`);
    replacements.etiqueta = etiqueta;
  }

  if (buscar) {
    condicionesSql.push(`(
      p.titulo ILIKE :buscar
      OR p.descripcion ILIKE :buscar
      OR EXISTS (
        SELECT 1
        FROM publicaciones_etiquetas pe_busqueda
        INNER JOIN etiquetas e_busqueda ON e_busqueda.id = pe_busqueda.id_etiqueta
        WHERE pe_busqueda.id_publicacion = p.id
          AND e_busqueda.name ILIKE :buscar
      )
    )`);
    replacements.buscar = `%${buscar}%`;
  }

  const whereSql = condicionesSql.join(" AND ");
  const [{ total }] = await sequelize.query(
    `SELECT COUNT(*)::int AS total FROM publicaciones p WHERE ${whereSql}`,
    {
      replacements,
      type: QueryTypes.SELECT,
    },
  );
  const publicacionesPaginadas = await sequelize.query(
    `SELECT p.id
     FROM publicaciones p
     WHERE ${whereSql}
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT :limit OFFSET :offset`,
    {
      replacements,
      type: QueryTypes.SELECT,
    },
  );
  const idsPublicaciones = publicacionesPaginadas.map((publicacion) => publicacion.id);
  const publicaciones = idsPublicaciones.length
    ? await Publicacion.findAll({
        where: {
          ...wherePublicacion,
          id: { [Op.in]: idsPublicaciones },
        },
        include: [
          {
            model: ImagenPublicacion,
            as: "imagenes",
            ...(usuarioActual
              ? {}
              : {
                  where: {
                    tipoLicencia: "creative_commons",
                  },
                  required: true,
                }),
          },
          {
            model: Etiqueta,
            as: "etiquetas",
            through: { attributes: [] },
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombreVisible", "nombreUsuario"],
          },
        ],
        order: [["created_at", "DESC"], ["id", "DESC"]],
      })
    : [];
  const count = total;
  const totalPaginas = Math.max(Math.ceil(count / publicacionesPorPagina), 1);

  res.render("pages/inicio", {
    title: "Fotaza 2",
    mensajeEstado: mensajesEstado[estado] || "",
    mensajeError: error || "",
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
