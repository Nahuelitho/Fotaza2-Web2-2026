function requerirAutenticacion(req, res, next) {
  if (req.session.usuario) {
    return next();
  }

  return res.redirect('/iniciar-sesion');
}

function requerirInvitado(req, res, next) {
  if (!req.session.usuario) {
    return next();
  }

  return res.redirect('/');
}
function impedirInteraccionValidador(req, res, next) {
  const rol = req.session.usuario?.rol;

  if (rol === "validador" || rol === "admin") {
    const destino = rol === "admin" ? "/admin/etiquetas" : "/validador/denuncias";
    return res.redirect(
      `${destino}?error=${encodeURIComponent(
        "Este perfil de gestion no puede interactuar con publicaciones.",
      )}`,
    );
  }

  return next();
}
module.exports = {
  requerirAutenticacion,
  requerirInvitado,
  impedirInteraccionValidador,
};
