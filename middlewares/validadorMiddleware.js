
function requerirValidador(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/iniciar-sesion');
  }

  if (req.session.usuario.rol !== 'validador') {
    return res.redirect('/?error=No tenes permiso para acceder al panel validador.');
  }

  return next();
}

module.exports = {
  requerirValidador,
};