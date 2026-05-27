const { sequelize, Post, PostImage, Tag, PostTag } = require('../models/sequelize');

const TIPOS_MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

function redirigirConError(res, mensaje) {
  return res.redirect(`/?error=${encodeURIComponent(mensaje)}`);
}

function normalizarEtiquetas(etiquetasCrudas) {
  if (!etiquetasCrudas) {
    return [];
  }

  return etiquetasCrudas
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .filter((tag, index, arr) => arr.indexOf(tag) === index);
}

async function crearPublicacion(req, res) {
  const usuarioActual = req.session.user;
  const { titulo, descripcion, tipoLicencia, textoMarcaAgua, etiquetas } = req.body;
  const archivoSubido = req.file;
  const tituloNormalizado = titulo?.trim();
  const descripcionNormalizada = descripcion?.trim() || null;
  const tipoLicenciaNormalizado = tipoLicencia?.trim();
  const textoMarcaAguaNormalizado = textoMarcaAgua?.trim() || null;
  const etiquetasNormalizadas = normalizarEtiquetas(etiquetas);

  if (!tituloNormalizado) {
    return redirigirConError(res, 'El titulo es obligatorio.');
  }

  if (!archivoSubido) {
    return redirigirConError(res, 'La imagen es obligatoria.');
  }

  if (!TIPOS_MIME_PERMITIDOS.includes(archivoSubido.mimetype)) {
    return redirigirConError(res, 'Solo se permiten imagenes JPG, PNG o WEBP.');
  }

  if (!['con_copyright', 'creative_commons'].includes(tipoLicenciaNormalizado)) {
    return redirigirConError(res, 'Selecciona una licencia valida.');
  }

  if (tipoLicenciaNormalizado === 'con_copyright' && !textoMarcaAguaNormalizado) {
    return redirigirConError(res, 'La marca de agua es obligatoria para imagenes con copyright.');
  }

  if (etiquetasNormalizadas.length === 0) {
    return redirigirConError(res, 'Debes ingresar al menos una etiqueta.');
  }

  const imagenBase64 = archivoSubido.buffer.toString('base64');

  const transaction = await sequelize.transaction();

  try {
    const post = await Post.create(
      {
        userId: usuarioActual.id,
        title: tituloNormalizado,
        description: descripcionNormalizada,
      },
      { transaction }
    );

    await PostImage.create(
      {
        postId: post.id,
        mimeType: archivoSubido.mimetype,
        imageBase64: imagenBase64,
        licenseType: tipoLicenciaNormalizado === 'con_copyright' ? 'copyright' : tipoLicenciaNormalizado,
        watermarkText: tipoLicenciaNormalizado === 'con_copyright' ? textoMarcaAguaNormalizado : null,
      },
      { transaction }
    );

    for (const nombreEtiqueta of etiquetasNormalizadas) {
      const [tag] = await Tag.findOrCreate({
        where: { name: nombreEtiqueta },
        defaults: { name: nombreEtiqueta },
        transaction,
      });

      await PostTag.findOrCreate({
        where: {
          postId: post.id,
          tagId: tag.id,
        },
        defaults: {
          postId: post.id,
          tagId: tag.id,
        },
        transaction,
      });
    }

    await transaction.commit();

    return res.redirect('/?estado=creada');
  } catch (error) {
    await transaction.rollback();
    return redirigirConError(res, 'No se pudo crear la publicacion.');
  }
}

module.exports = {
  crearPublicacion,
};
