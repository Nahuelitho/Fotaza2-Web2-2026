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
  if (req.session.usuario?.rol === "validador") {
    return res.redirect(
      `/validador/denuncias?error=${encodeURIComponent(
        "El perfil validador solo puede revisar publicaciones.",
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
