function requerirAdmin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/iniciar-sesion');
  }

  if (req.session.usuario.rol !== 'admin') {
    return res.redirect('/?error=No tenes permiso para acceder al panel administrador.');
  }

  return next();
}

module.exports = { requerirAdmin };
