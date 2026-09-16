const { Op, QueryTypes } = require("sequelize");
const {
  sequelize,
  Publicacion,
  ImagenPublicacion,
  Etiqueta,
  Usuario,
  Seguimiento,
} = require("../models/sequelize");

function armarUrlPagina(pagina, filtros) {
  const params = new URLSearchParams();

  for (const [nombre, valor] of Object.entries(filtros)) {
    if (valor) {
      params.set(nombre, valor);
    }
  }

  params.set("pagina", pagina);

  return `/?${params.toString()}`;
}

async function renderizarInicio(req, res) {
  const estado = req.query.estado || "";
  const error = req.query.error || "";
  const buscar = req.query.buscar?.trim() || "";
  const etiqueta = req.query.etiqueta?.trim() || "";
  const licencia = ["con_copyright", "creative_commons"].includes(
    req.query.licencia,
  )
    ? req.query.licencia
    : "";
  const autor = req.query.autor?.trim() || "";
  const fechaDesde = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fechaDesde || "")
    ? req.query.fechaDesde
    : "";
  const fechaHasta = /^\d{4}-\d{2}-\d{2}$/.test(req.query.fechaHasta || "")
    ? req.query.fechaHasta
    : "";
  const valoracionMinima = ["1", "2", "3", "4", "5"].includes(
    req.query.valoracionMinima,
  )
    ? req.query.valoracionMinima
    : "";
  const orden = req.query.orden === "mejor_valoradas"
    ? "mejor_valoradas"
    : "recientes";
  const publicacionesPorPagina = 6;
  const paginaPedida = Number(req.query.pagina) || 1;
  const paginaActual = Math.max(paginaPedida, 1);
  const offset = (paginaActual - 1) * publicacionesPorPagina;
  const filtrosBusqueda = {
    buscar,
    etiqueta,
    licencia,
    autor,
    fechaDesde,
    fechaHasta,
    valoracionMinima,
    orden,
  };
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

  if (licencia) {
    condicionesSql.push(`EXISTS (
      SELECT 1 FROM imagenes_publicacion ip_licencia
      WHERE ip_licencia.id_publicacion = p.id
        AND ip_licencia.tipo_licencia = :licencia
    )`);
    replacements.licencia = licencia;
  }

  if (autor) {
    condicionesSql.push(`EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = p.id_usuario
        AND (u.nombre_usuario ILIKE :autor OR u.nombre_visible ILIKE :autor)
    )`);
    replacements.autor = `%${autor}%`;
  }

  if (fechaDesde) {
    condicionesSql.push("p.created_at >= :fechaDesde");
    replacements.fechaDesde = `${fechaDesde} 00:00:00`;
  }

  if (fechaHasta) {
    condicionesSql.push("p.created_at < CAST(:fechaHasta AS date) + INTERVAL '1 day'");
    replacements.fechaHasta = fechaHasta;
  }

  if (valoracionMinima) {
    condicionesSql.push(`COALESCE((
      SELECT AVG(vi.puntaje)
      FROM imagenes_publicacion ip_valoracion
      INNER JOIN valoraciones_imagen vi ON vi.id_imagen = ip_valoracion.id
      WHERE ip_valoracion.id_publicacion = p.id
    ), 0) >= :valoracionMinima`);
    replacements.valoracionMinima = Number(valoracionMinima);
  }

  const whereSql = condicionesSql.join(" AND ");
  const ordenSql = orden === "mejor_valoradas"
    ? `COALESCE((
        SELECT AVG(vi_orden.puntaje)
        FROM imagenes_publicacion ip_orden
        INNER JOIN valoraciones_imagen vi_orden ON vi_orden.id_imagen = ip_orden.id
        WHERE ip_orden.id_publicacion = p.id
      ), 0) DESC, p.created_at DESC, p.id DESC`
    : "p.created_at DESC, p.id DESC";
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
     ORDER BY ${ordenSql}
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

const publicacionesMasVistasPublicas = await Publicacion.findAll({
  where: {
    visibilidad: "publica",
    estado: "activa",
  },
  include: [
    {
      model: ImagenPublicacion,
      as: "imagenes",
      where: {
        tipoLicencia: "creative_commons",
      },
      required: true,
    },
  ],
  order: [["vistas", "DESC"]],
  limit: 3,
});

const publicacionesMasVistasCopyright = usuarioActual
  ? await Publicacion.findAll({
      where: {
        visibilidad: "publica",
        estado: "activa",
      },
      include: [
        {
          model: ImagenPublicacion,
          as: "imagenes",
          where: {
            tipoLicencia: "con_copyright",
          },
          required: true,
        },
      ],
      order: [["vistas", "DESC"]],
      limit: 3,
    })
  : [];
  res.render("pages/inicio", {
    title: "Fotaza 2",
    mensajeEstado: mensajesEstado[estado] || "",
    mensajeError: error || "",
    publicaciones,
    filtrosBusqueda,
    publicacionesMasVistasPublicas,
    publicacionesMasVistasCopyright,
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

async function renderizarPublicacionesSeguidas(req, res) {
  const seguimientos = await Seguimiento.findAll({
    where: {
      idSeguidor: Number(req.session.usuario.id),
    },
    attributes: ["idSeguido"],
    raw: true,
  });
  const idsSeguidos = seguimientos.map((seguimiento) => seguimiento.idSeguido);

  const publicaciones = idsSeguidos.length
    ? await Publicacion.findAll({
        where: {
          idUsuario: { [Op.in]: idsSeguidos },
          visibilidad: "publica",
          estado: "activa",
        },
        include: [
          {
            model: ImagenPublicacion,
            as: "imagenes",
          },
          {
            model: Etiqueta,
            as: "etiquetas",
            through: { attributes: [] },
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombreVisible", "nombreUsuario"],
          },
        ],
        order: [["created_at", "DESC"]],
      })
    : [];

  return res.render("pages/publicaciones-seguidas", {
    title: "Publicaciones de usuarios seguidos | Fotaza 2",
    publicaciones,
    filtrosBusqueda,
  });
}

module.exports = {
  renderizarInicio,
  renderizarPublicacionesSeguidas,
};
