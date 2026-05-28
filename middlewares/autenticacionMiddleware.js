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

module.exports = {
  requerirAutenticacion,
  requerirInvitado,
};
