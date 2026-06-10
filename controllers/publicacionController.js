const { sequelize, Publicacion, ImagenPublicacion, Etiqueta, PublicacionEtiqueta, Usuario, Comentario, ValoracionImagen } = require('../models/sequelize');

const TIPOS_MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

function redirigirConError(res, mensaje) {
  return res.redirect(`/?error=${encodeURIComponent(mensaje)}`);
}

function normalizarEtiquetasDesdeFormulario(etiquetasExistentes, etiquetaNueva) {
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
  const usuarioActual = req.session.usuario;
  const { titulo, descripcion, tipoLicencia, textoMarcaAgua, etiquetasExistentes, etiquetaNueva } = req.body;
  const archivoSubido = req.file;
  const tituloNormalizado = titulo?.trim();
  const descripcionNormalizada = descripcion?.trim() || null;
  const tipoLicenciaNormalizado = tipoLicencia?.trim();
  const textoMarcaAguaNormalizado = textoMarcaAgua?.trim() || null;
  const etiquetasNormalizadas = normalizarEtiquetasDesdeFormulario(etiquetasExistentes, etiquetaNueva);

  if (!tituloNormalizado) {
    return redirigirConError(res, 'Ingresa un titulo para la publicacion.');
  }

  if (!archivoSubido) {
    return redirigirConError(res, 'Selecciona una imagen para publicar.');
  }

  if (!TIPOS_MIME_PERMITIDOS.includes(archivoSubido.mimetype)) {
    return redirigirConError(res, 'La imagen debe ser JPG, PNG o WEBP.');
  }

  if (!['con_copyright', 'creative_commons'].includes(tipoLicenciaNormalizado)) {
    return redirigirConError(res, 'Selecciona una licencia valida.');
  }

  if (tipoLicenciaNormalizado === 'con_copyright' && !textoMarcaAguaNormalizado) {
    return redirigirConError(res, 'Ingresa una marca de agua para imagenes con copyright.');
  }

  if (etiquetasNormalizadas.length === 0) {
    return redirigirConError(res, 'Debes elegir al menos una etiqueta.');
  }

  if (etiquetasNormalizadas.length > 3) {
    return redirigirConError(res, 'Solo podes elegir hasta 3 etiquetas.');
  }

  const imagenBase64 = archivoSubido.buffer.toString('base64');

  const transaction = await sequelize.transaction();

  try {
    const publicacion = await Publicacion.create(
      {
        idUsuario: usuarioActual.id,
        titulo: tituloNormalizado,
        descripcion: descripcionNormalizada,
      },
      { transaction }
    );

    await ImagenPublicacion.create(
      {
        idPublicacion: publicacion.id,
        tipoMime: archivoSubido.mimetype,
        imagenBase64,
        tipoLicencia: tipoLicenciaNormalizado,
        textoMarcaAgua: tipoLicenciaNormalizado === 'con_copyright' ? textoMarcaAguaNormalizado : null,
      },
      { transaction }
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

    return res.redirect('/?estado=creada');
  } catch (error) {
    await transaction.rollback();
    return redirigirConError(res, 'No se pudo crear la publicacion. Intentalo nuevamente.');
  }
}

async function mostrarDetallePublicacion(req, res) {
  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
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
      {
        model: Comentario,
        as: 'comentarios',
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombreVisible', 'nombreUsuario'],
          },
        ],
      },
    ],
    order: [[{ model: Comentario, as: 'comentarios' }, 'created_at', 'ASC']],
  });

  if (!publicacion) {
    return res.status(404).render('pages/inicio', {
      title: 'Publicacion no encontrada',
      publicaciones: [],
      mensajeError: 'La publicacion no existe o ya no esta disponible.',
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
    const suma = valoraciones.reduce((total, valoracion) => total + valoracion.puntaje, 0);
    const valoracionUsuario = req.session.usuario
      ? valoraciones.find((valoracion) => valoracion.idUsuario === req.session.usuario.id)
      : null;

    valoracionResumen = {
      promedio: cantidad ? (suma / cantidad).toFixed(1) : 0,
      cantidad,
      valoracionUsuario,
    };
  }

  return res.render('pages/publicacion-detalle', {
    title: `${publicacion.titulo} | Fotaza 2`,
    extraCss: ['/css/publicacion-detalle.css'],
    usuarioActual: req.session.usuario || null,
    mensajeError: req.query.error || '',
    valoracionResumen,
    publicacion,
  });
}

async function eliminarPublicacion(req, res) {
  const usuarioActual = req.session.usuario;
  const publicacion = await Publicacion.findByPk(req.params.id);

  if (!publicacion) {
    return res.redirect('/?error=La publicacion no existe o ya no esta disponible.');
  }

  if (publicacion.idUsuario !== usuarioActual.id) {
    return res.redirect(`/publicaciones/${req.params.id}?error=Solo el autor puede eliminar esta publicacion.`);
  }

  await publicacion.update({ estado: 'eliminada' });

  return res.redirect('/?estado=eliminada');
}

async function crearComentario(req, res) {
  const contenido = req.body.contenido?.trim();

  if (!contenido) {
    return res.redirect(`/publicaciones/${req.params.id}?error=Escribi un comentario antes de enviarlo.`);
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
      visibilidad: 'publica',
      estado: 'activa',
    },
  });

  if (!publicacion) {
    return res.redirect('/?error=La publicacion no existe o ya no esta disponible.');
  }

  if (!publicacion.comentariosHabilitados) {
    return res.redirect(`/publicaciones/${req.params.id}?error=Los comentarios de esta publicacion estan cerrados.`);
  }

  await Comentario.create({
    idPublicacion: publicacion.id,
    idUsuario: req.session.usuario.id,
    contenido,
  });

  return res.redirect(`/publicaciones/${publicacion.id}`);
}

async function valorarPublicacion(req, res) {
  const usuarioActual = req.session.usuario;
  const puntaje = Number(req.body.puntaje);

  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    return res.redirect(`/publicaciones/${req.params.id}?error=Selecciona una valoracion entre 1 y 5.`);
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: req.params.id,
      visibilidad: 'publica',
      estado: 'activa',
    },
    include: [
      {
        model: ImagenPublicacion,
        as: 'imagenes',
      },
    ],
  });

  if (!publicacion) {
    return res.redirect('/?error=La publicacion no existe o ya no esta disponible.');
  }

  if (publicacion.idUsuario === usuarioActual.id) {
    return res.redirect(`/publicaciones/${publicacion.id}?error=No podes valorar tu propia publicacion.`);
  }

  const imagen = publicacion.imagenes && publicacion.imagenes[0];

  if (!imagen) {
    return res.redirect(`/publicaciones/${publicacion.id}?error=La publicacion no tiene imagen para valorar.`);
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
  valorarPublicacion,
};
