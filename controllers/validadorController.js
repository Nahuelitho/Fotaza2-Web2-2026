const {
  sequelize,
  DenunciaPublicacion,
  DenunciaComentario,
  Comentario,
  Publicacion,
  Usuario,
  ImagenPublicacion,
  Etiqueta,
} = require("../models/sequelize");

const vistasPermitidas = {
  pendientes: {
    estadoDenuncia: "pendiente",
    estadoPublicacion: "en_revision",
    titulo: "Denuncias pendientes",
  },
  desestimadas: {
    estadoDenuncia: "desestimada",
    estadoPublicacion: null,
    titulo: "Denuncias desestimadas",
  },
  bajas: {
    estadoDenuncia: "aceptada",
    estadoPublicacion: "eliminada",
    titulo: "Denuncias dadas de baja",
  },
};

function obtenerVista(nombreVista) {
  return vistasPermitidas[nombreVista] ? nombreVista : "pendientes";
}

function redirigirPanelConError(res, mensaje) {
  return res.redirect(
    `/validador/denuncias?error=${encodeURIComponent(mensaje)}`,
  );
}

async function mostrarPanelDenuncias(req, res) {
  const vistaActual = obtenerVista(req.query.vista);
  const configuracion = vistasPermitidas[vistaActual];

  const wherePublicacion = {};

  if (configuracion.estadoPublicacion) {
    wherePublicacion.estado = configuracion.estadoPublicacion;
  }

  const publicaciones = await Publicacion.findAll({
    where: wherePublicacion,
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nombreUsuario", "nombreVisible"],
      },
      {
        model: ImagenPublicacion,
        as: "imagenes",
      },
      {
        model: Etiqueta,
        as: "etiquetas",
        through: {
          attributes: [],
        },
      },
      {
        model: DenunciaPublicacion,
        as: "denuncias",
        required: true,
        where: {
          estado: configuracion.estadoDenuncia,
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombreUsuario", "nombreVisible"],
          },
        ],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  const denunciasComentarios = await DenunciaComentario.findAll({
    where: {
      estado: configuracion.estadoDenuncia,
    },
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nombreUsuario", "nombreVisible"],
      },
      {
        model: Comentario,
        as: "comentario",
        required: true,
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombreUsuario", "nombreVisible"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return res.render("pages/validador-denuncias", {
    title: "Panel validador | Fotaza 2",
    extraCss: ["/css/validador.css"],
    publicaciones,
    denunciasComentarios,
    vistaActual,
    tituloListado: configuracion.titulo,
    mensajeError: req.query.error || "",
    mensajeExito: req.query.exito || "",
  });
}

async function mostrarDetalleModeracion(req, res) {
  const idPublicacion = Number(req.params.id);
  const vistaActual = obtenerVista(req.query.vista);
  const configuracion = vistasPermitidas[vistaActual];

  if (!Number.isInteger(idPublicacion)) {
    return redirigirPanelConError(
      res,
      "La publicacion indicada no es valida.",
    );
  }

  const wherePublicacion = {
    id: idPublicacion,
  };

  if (configuracion.estadoPublicacion) {
    wherePublicacion.estado = configuracion.estadoPublicacion;
  }

  const publicacion = await Publicacion.findOne({
    where: wherePublicacion,
    include: [
      {
        model: Usuario,
        as: "usuario",
        attributes: ["id", "nombreUsuario", "nombreVisible"],
      },
      {
        model: ImagenPublicacion,
        as: "imagenes",
      },
      {
        model: Etiqueta,
        as: "etiquetas",
        through: {
          attributes: [],
        },
      },
      {
        model: DenunciaPublicacion,
        as: "denuncias",
        required: true,
        where: {
          estado: configuracion.estadoDenuncia,
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombreUsuario", "nombreVisible"],
          },
        ],
      },
    ],
  });

  if (!publicacion) {
    return res.redirect(
      `/validador/denuncias?vista=${vistaActual}&error=${encodeURIComponent(
        "La publicacion no existe o no pertenece a esta lista.",
      )}`,
    );
  }

  return res.render("pages/validador-publicacion-detalle", {
    title: `Revisar ${publicacion.titulo} | Fotaza 2`,
    extraCss: ["/css/validador.css"],
    publicacion,
    vistaActual,
    puedeModerar:
      vistaActual === "pendientes" && publicacion.estado === "en_revision",
    mensajeError: req.query.error || "",
    mensajeExito: req.query.exito || "",
  });
}

async function desestimarDenuncias(req, res) {
  const idPublicacion = Number(req.params.id);

  if (!Number.isInteger(idPublicacion)) {
    return redirigirPanelConError(
      res,
      "La publicacion indicada no es valida.",
    );
  }

  try {
    const procesada = await sequelize.transaction(async (transaction) => {
      const publicacion = await Publicacion.findOne({
        where: {
          id: idPublicacion,
          estado: "en_revision",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!publicacion) {
        return false;
      }

      const [cantidadActualizada] = await DenunciaPublicacion.update(
        {
          estado: "desestimada",
        },
        {
          where: {
            idPublicacion,
            estado: "pendiente",
          },
          transaction,
        },
      );

      if (cantidadActualizada === 0) {
        return false;
      }

      await publicacion.update(
        {
          estado: "activa",
        },
        {
          transaction,
        },
      );

      return true;
    });

    if (!procesada) {
      return redirigirPanelConError(
        res,
        "La publicacion no existe o ya fue revisada.",
      );
    }

    return res.redirect(
      `/validador/denuncias?vista=desestimadas&exito=${encodeURIComponent(
        "Las denuncias fueron desestimadas y la publicacion volvio a estar activa.",
      )}`,
    );
  } catch (error) {
    console.error("Error al desestimar denuncias:", error);

    return redirigirPanelConError(
      res,
      "No se pudieron desestimar las denuncias.",
    );
  }
}

async function darDeBajaPublicacion(req, res) {
  const idPublicacion = Number(req.params.id);

  if (!Number.isInteger(idPublicacion)) {
    return redirigirPanelConError(
      res,
      "La publicacion indicada no es valida.",
    );
  }

  try {
    const resultado = await sequelize.transaction(async (transaction) => {
      const publicacion = await Publicacion.findOne({
        where: {
          id: idPublicacion,
          estado: "en_revision",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!publicacion) {
        return null;
      }

      const autor = await Usuario.findByPk(publicacion.idUsuario, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!autor) {
        return null;
      }

      const [cantidadActualizada] = await DenunciaPublicacion.update(
        {
          estado: "aceptada",
        },
        {
          where: {
            idPublicacion,
            estado: "pendiente",
          },
          transaction,
        },
      );

      if (cantidadActualizada === 0) {
        return null;
      }

      await publicacion.update(
        {
          estado: "eliminada",
        },
        {
          transaction,
        },
      );

      const nuevaCantidadBajas =
        Number(autor.cantidadPublicacionesEliminadas) + 1;

      await autor.update(
        {
          cantidadPublicacionesEliminadas: nuevaCantidadBajas,
          estaActivo:
            nuevaCantidadBajas >= 3 ? false : autor.estaActivo,
        },
        {
          transaction,
        },
      );

      return {
        usuarioInactivado: nuevaCantidadBajas >= 3,
      };
    });

    if (!resultado) {
      return redirigirPanelConError(
        res,
        "La publicacion no existe o ya fue revisada.",
      );
    }

    const mensaje = resultado.usuarioInactivado
      ? "La publicacion fue dada de baja y la cuenta del autor fue inactivada."
      : "La publicacion fue dada de baja correctamente.";

    return res.redirect(
      `/validador/denuncias?vista=bajas&exito=${encodeURIComponent(mensaje)}`,
    );
  } catch (error) {
    console.error("Error al dar de baja la publicacion:", error);

    return redirigirPanelConError(
      res,
      "No se pudo dar de baja la publicacion.",
    );
  }
}
async function desestimarDenunciaComentario(req, res) {
  const idDenuncia = Number(req.params.id);

  if (!Number.isInteger(idDenuncia)) {
    return redirigirPanelConError(res, "La denuncia indicada no es valida.");
  }

  const denuncia = await DenunciaComentario.findByPk(idDenuncia);

  if (!denuncia || denuncia.estado !== "pendiente") {
    return redirigirPanelConError(
      res,
      "La denuncia no existe o ya fue revisada.",
    );
  }

  await denuncia.update({
    estado: "desestimada",
  });

  return res.redirect(
    `/validador/denuncias?vista=desestimadas&exito=${encodeURIComponent(
      "La denuncia del comentario fue desestimada.",
    )}`,
  );
}

async function aceptarDenunciaComentario(req, res) {
  const idDenuncia = Number(req.params.id);

  if (!Number.isInteger(idDenuncia)) {
    return redirigirPanelConError(res, "La denuncia indicada no es valida.");
  }

  const denuncia = await DenunciaComentario.findByPk(idDenuncia);

  if (!denuncia || denuncia.estado !== "pendiente") {
    return redirigirPanelConError(
      res,
      "La denuncia no existe o ya fue revisada.",
    );
  }

  await sequelize.transaction(async (transaction) => {
    await DenunciaComentario.update(
      {
        estado: "aceptada",
      },
      {
        where: {
          idComentario: denuncia.idComentario,
          estado: "pendiente",
        },
        transaction,
      },
    );

    await Comentario.destroy({
      where: {
        id: denuncia.idComentario,
      },
      transaction,
    });
  });

  return res.redirect(
    `/validador/denuncias?vista=bajas&exito=${encodeURIComponent(
      "La denuncia fue aceptada y el comentario fue eliminado.",
    )}`,
  );
}
module.exports = {
  desestimarDenunciaComentario,
  aceptarDenunciaComentario,
  mostrarPanelDenuncias,
  mostrarDetalleModeracion,
  desestimarDenuncias,
  darDeBajaPublicacion,
};
