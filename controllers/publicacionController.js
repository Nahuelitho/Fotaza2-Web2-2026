const {
  sequelize,
  Publicacion,
  ImagenPublicacion,
  Etiqueta,
  PublicacionEtiqueta,
  Usuario,
  Comentario,
  ValoracionImagen,
  Seguimiento,
} = require("../models/sequelize");

const TIPOS_MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

function redirigirConError(res, mensaje) {
  return res.redirect(`/?error=${encodeURIComponent(mensaje)}`);
}

function normalizarEtiquetasDesdeFormulario(
  etiquetasExistentes,
  etiquetaNueva,
) {
  const etiquetasSeleccionadas = Array.isArray(etiquetasExistentes)
    ? etiquetasExistentes
    : etiquetasExistentes
      ? [etiquetasExistentes]
      : [];

  const etiquetasCrudas = [...etiquetasSeleccionadas];

  if (etiquetaNueva?.trim()) {
    etiquetasCrudas.push(etiquetaNueva.trim());
  }

  return etiquetasCrudas
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

async function crearPublicacion(req, res) {
  let transaction;

  try {
    const usuarioActual = req.session.usuario;

    const {
      titulo,
      descripcion,
      tipoLicencia,
      textoMarcaAgua,
      etiquetasExistentes,
      etiquetaNueva,
    } = req.body;

    const archivoSubido = req.file;

    console.log("Body recibido:", {
      titulo,
      descripcion,
      tipoLicencia,
      textoMarcaAgua,
      etiquetasExistentes,
      etiquetaNueva,
    });

    console.log("Archivo recibido:", {
      existe: !!archivoSubido,
      originalname: archivoSubido?.originalname,
      mimetype: archivoSubido?.mimetype,
      size: archivoSubido?.size,
      tieneBuffer: !!archivoSubido?.buffer,
    });

    if (!usuarioActual) {
      return redirigirConError(
        res,
        "Tu sesion expiro. Inicia sesion nuevamente.",
      );
    }

    const tituloNormalizado = titulo?.trim();
    const descripcionNormalizada = descripcion?.trim() || null;
    const tipoLicenciaNormalizado = tipoLicencia?.trim();
    const textoMarcaAguaNormalizado = textoMarcaAgua?.trim() || null;

    const etiquetasNormalizadas = normalizarEtiquetasDesdeFormulario(
      etiquetasExistentes,
      etiquetaNueva,
    );

    if (!tituloNormalizado) {
      return redirigirConError(res, "Ingresa un titulo para la publicacion.");
    }

    if (!archivoSubido) {
      return redirigirConError(res, "Selecciona una imagen para publicar.");
    }

    if (!archivoSubido.buffer) {
      console.error("El archivo llego, pero no tiene buffer. Revisa multer.");

      return redirigirConError(
        res,
        "No se pudo procesar la imagen. Revisa la configuracion de subida.",
      );
    }

    if (archivoSubido.size > 2 * 1024 * 1024) {
      return redirigirConError(
        res,
        "La imagen es demasiado pesada. Sube una imagen menor a 2 MB.",
      );
    }

    if (!TIPOS_MIME_PERMITIDOS.includes(archivoSubido.mimetype)) {
      return redirigirConError(res, "La imagen debe ser JPG, PNG o WEBP.");
    }

    if (
      !["con_copyright", "creative_commons"].includes(tipoLicenciaNormalizado)
    ) {
      return redirigirConError(res, "Selecciona una licencia valida.");
    }

    if (
      tipoLicenciaNormalizado === "con_copyright" &&
      !textoMarcaAguaNormalizado
    ) {
      return redirigirConError(
        res,
        "Ingresa una marca de agua para imagenes con copyright.",
      );
    }

    if (etiquetasNormalizadas.length === 0) {
      return redirigirConError(res, "Debes elegir al menos una etiqueta.");
    }

    if (etiquetasNormalizadas.length > 3) {
      return redirigirConError(res, "Solo podes elegir hasta 3 etiquetas.");
    }

    if (!archivoSubido.buffer) {
      console.error("El archivo llegó, pero no tiene buffer:", archivoSubido);

      return redirigirConError(
        res,
        "No se pudo procesar la imagen. Intentalo nuevamente.",
      );
    }

    const imagenBase64 = archivoSubido.buffer.toString("base64");

    console.log("Imagen convertida a base64:", {
      sizeOriginalBytes: archivoSubido.size,
      sizeBase64Caracteres: imagenBase64.length,
    });

    transaction = await sequelize.transaction();

    const publicacion = await Publicacion.create(
      {
        idUsuario: usuarioActual.id,
        titulo: tituloNormalizado,
        descripcion: descripcionNormalizada,
      },
      { transaction },
    );

    await ImagenPublicacion.create(
      {
        idPublicacion: publicacion.id,
        tipoMime: archivoSubido.mimetype,
        imagenBase64,
        tipoLicencia: tipoLicenciaNormalizado,
        textoMarcaAgua:
          tipoLicenciaNormalizado === "con_copyright"
            ? textoMarcaAguaNormalizado
            : null,
      },
      { transaction },
    );

    for (const nombreEtiqueta of etiquetasNormalizadas) {
      const [etiqueta] = await Etiqueta.findOrCreate({
        where: { name: nombreEtiqueta },
        defaults: { name: nombreEtiqueta },
        transaction,
      });

      await PublicacionEtiqueta.findOrCreate({
        where: {
          idPublicacion: publicacion.id,
          idEtiqueta: etiqueta.id,
        },
        defaults: {
          idPublicacion: publicacion.id,
          idEtiqueta: etiqueta.id,
        },
        transaction,
      });
    }

    await transaction.commit();

    return res.redirect("/?estado=creada");
  } catch (error) {
    await transaction.rollback();

    return redirigirConError(
      res,
      "No se pudo crear la publicacion. Intentalo nuevamente.",
    );
  }
}
async function mostrarDetallePublicacion(req, res) {
  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
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
      {
        model: Comentario,
        as: "comentarios",
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombreVisible", "nombreUsuario"],
          },
        ],
      },
    ],
    order: [[{ model: Comentario, as: "comentarios" }, "created_at", "ASC"]],
  });

  if (!publicacion) {
    return res.status(404).render("pages/inicio", {
      title: "Publicacion no encontrada",
      publicaciones: [],
      mensajeError: "La publicacion no existe o ya no esta disponible.",
    });
  }

  const imagen = publicacion.imagenes && publicacion.imagenes[0];
  let valoracionResumen = {
    promedio: 0,
    cantidad: 0,
    valoracionUsuario: null,
  };

  if (imagen) {
    const valoraciones = await ValoracionImagen.findAll({
      where: { idImagen: imagen.id },
    });
    const cantidad = valoraciones.length;
    const suma = valoraciones.reduce(
      (total, valoracion) => total + valoracion.puntaje,
      0,
    );
    const valoracionUsuario = req.session.usuario
      ? valoraciones.find(
          (valoracion) => valoracion.idUsuario === req.session.usuario.id,
        )
      : null;

    valoracionResumen = {
      promedio: cantidad ? (suma / cantidad).toFixed(1) : 0,
      cantidad,
      valoracionUsuario,
    };
  }
  const usuarioActual = req.session.usuario || null;

  const cantidadSeguidoresAutor = await Seguimiento.count({
    where: { idSeguido: publicacion.idUsuario },
  });

  const cantidadSeguidosAutor = await Seguimiento.count({
    where: { idSeguidor: publicacion.idUsuario },
  });

  const esAutor =
    usuarioActual && Number(usuarioActual.id) === Number(publicacion.idUsuario);

  let yaSigueAutor = false;

  if (usuarioActual && !esAutor) {
    const seguimientoAutor = await Seguimiento.findOne({
      where: {
        idSeguidor: Number(usuarioActual.id),
        idSeguido: Number(publicacion.idUsuario),
      },
    });

    yaSigueAutor = Boolean(seguimientoAutor);
  }
  return res.render("pages/publicacion-detalle", {
    title: `${publicacion.titulo} | Fotaza 2`,
    extraCss: ["/css/publicacion-detalle.css"],
    usuarioActual,
    mensajeError: req.query.error || "",
    valoracionResumen,
    estadisticasAutor: {
      cantidadSeguidores: cantidadSeguidoresAutor,
      cantidadSeguidos: cantidadSeguidosAutor,
    },
    yaSigueAutor,
    publicacion,
  });
}

async function eliminarPublicacion(req, res) {
  const usuarioActual = req.session.usuario;
  const publicacion = await Publicacion.findByPk(req.params.id);

  if (!publicacion) {
    return res.redirect(
      "/?error=La publicacion no existe o ya no esta disponible.",
    );
  }

  if (publicacion.idUsuario !== usuarioActual.id) {
    return res.redirect(
      `/publicaciones/${req.params.id}?error=Solo el autor puede eliminar esta publicacion.`,
    );
  }

  await publicacion.update({ estado: "eliminada" });

  return res.redirect("/?estado=eliminada");
}

async function crearComentario(req, res) {
  const contenido = req.body.contenido?.trim();

  if (!contenido) {
    return res.redirect(
      `/publicaciones/${req.params.id}?error=Escribi un comentario antes de enviarlo.`,
    );
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
      visibilidad: "publica",
      estado: "activa",
    },
  });

  if (!publicacion) {
    return res.redirect(
      "/?error=La publicacion no existe o ya no esta disponible.",
    );
  }

  if (!publicacion.comentariosHabilitados) {
    return res.redirect(
      `/publicaciones/${req.params.id}?error=Los comentarios de esta publicacion estan cerrados.`,
    );
  }

  await Comentario.create({
    idPublicacion: publicacion.id,
    idUsuario: req.session.usuario.id,
    contenido,
  });

  return res.redirect(`/publicaciones/${publicacion.id}`);
}
async function eliminarComentario(req, res) {
  const usuarioActual = req.session.usuario;
  const { id, comentarioId } = req.params;

  const publicacion = await Publicacion.findOne({
    where: {
      id,
      visibilidad: "publica",
      estado: "activa",
    },
  });

  if (!publicacion) {
    return res.redirect(
      "/?error=La publicacion no existe o ya no esta disponible.",
    );
  }

  if (Number(publicacion.idUsuario) !== Number(usuarioActual.id)) {
    return res.redirect(
      `/publicaciones/${publicacion.id}?error=Solo el dueño de la publicacion puede eliminar comentarios.`,
    );
  }

  const comentario = await Comentario.findOne({
    where: {
      id: comentarioId,
      idPublicacion: publicacion.id,
    },
  });

  if (!comentario) {
    return res.redirect(
      `/publicaciones/${publicacion.id}?error=El comentario no existe o no pertenece a esta publicacion.`,
    );
  }

  await comentario.destroy();

  return res.redirect(`/publicaciones/${publicacion.id}`);
}
async function valorarPublicacion(req, res) {
  const usuarioActual = req.session.usuario;
  const puntaje = Number(req.body.puntaje);

  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    return res.redirect(
      `/publicaciones/${req.params.id}?error=Selecciona una valoracion entre 1 y 5.`,
    );
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
      visibilidad: "publica",
      estado: "activa",
    },
    include: [
      {
        model: ImagenPublicacion,
        as: "imagenes",
      },
    ],
  });

  if (!publicacion) {
    return res.redirect(
      "/?error=La publicacion no existe o ya no esta disponible.",
    );
  }

  if (publicacion.idUsuario === usuarioActual.id) {
    return res.redirect(
      `/publicaciones/${publicacion.id}?error=No podes valorar tu propia publicacion.`,
    );
  }

  const imagen = publicacion.imagenes && publicacion.imagenes[0];

  if (!imagen) {
    return res.redirect(
      `/publicaciones/${publicacion.id}?error=La publicacion no tiene imagen para valorar.`,
    );
  }

  const valoracionExistente = await ValoracionImagen.findOne({
    where: {
      idImagen: imagen.id,
      idUsuario: usuarioActual.id,
    },
  });

  if (valoracionExistente) {
    await valoracionExistente.update({ puntaje });
  } else {
    await ValoracionImagen.create({
      idImagen: imagen.id,
      idUsuario: usuarioActual.id,
      puntaje,
    });
  }

  return res.redirect(`/publicaciones/${publicacion.id}`);
}

module.exports = {
  crearPublicacion,
  mostrarDetallePublicacion,
  eliminarPublicacion,
  crearComentario,
  eliminarComentario,
  valorarPublicacion,
};
