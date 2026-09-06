const {
  DenunciaPublicacion,
  Publicacion,
} = require('../models/sequelize');

async function denunciarPublicacion(req, res) {
  const usuarioActual = req.session.usuario;
  const idPublicacion = Number(req.params.id);
  const motivo = String(req.body.motivo || '').trim();
  const descripcion = String(req.body.descripcion || '').trim();

  if (!Number.isInteger(idPublicacion)) {
    return res.redirect('/?error=Publicacion invalida.');
  }

  if (!motivo) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'Selecciona un motivo para denunciar.'
      )}`
    );
  }

  if (motivo.length > 80) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'El motivo no puede superar los 80 caracteres.'
      )}`
    );
  }

  if (!descripcion) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'La descripcion es obligatoria para enviar una denuncia.'
      )}`
    );
  }

  if (descripcion.length > 500) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'La descripcion no puede superar los 500 caracteres.'
      )}`
    );
  }

  const publicacion = await Publicacion.findOne({
    where: {
      id: idPublicacion,
      estado: 'activa',
    },
  });

  if (!publicacion) {
    return res.redirect('/?error=La publicacion no existe o no esta disponible.');
  }

  if (Number(publicacion.idUsuario) === Number(usuarioActual.id)) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'No podes denunciar tu propia publicacion.'
      )}`
    );
  }

  const denunciaExistente = await DenunciaPublicacion.findOne({
    where: {
      idPublicacion,
      idUsuario: Number(usuarioActual.id),
    },
  });

  if (denunciaExistente) {
    return res.redirect(
      `/publicaciones/${idPublicacion}?error=${encodeURIComponent(
        'Ya denunciaste esta publicacion.'
      )}`
    );
  }

  await DenunciaPublicacion.create({
    idPublicacion,
    idUsuario: Number(usuarioActual.id),
    motivo,
    descripcion,
  });

  const cantidadDenuncias = await DenunciaPublicacion.count({
    where: {
      idPublicacion,
      estado: 'pendiente',
    },
  });

  if (cantidadDenuncias >= 3) {
    await publicacion.update({
      estado: 'en_revision',
    });

    return res.redirect('/?estado=en_revision');
  }

  return res.redirect(
    `/publicaciones/${idPublicacion}?exito=${encodeURIComponent(
      'Denuncia enviada correctamente.'
    )}`
  );
}

module.exports = {
  denunciarPublicacion,
};
