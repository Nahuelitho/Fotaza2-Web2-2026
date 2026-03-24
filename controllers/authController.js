function renderLogin(req, res) {
  res.render('pages/login', {
    title: 'Iniciar sesion | Fotaza 2',
    authTitle: 'Volve a tu espacio visual.',
    authEyebrow: 'Iniciar sesion',
    authText: 'Accede a tus publicaciones, favoritos y conexiones dentro de la comunidad.',
    authMode: 'login',
  });
}

function renderRegister(req, res) {
  res.render('pages/register', {
    title: 'Crear cuenta | Fotaza 2',
    authTitle: 'Crea tu perfil en Fotaza 2.',
    authEyebrow: 'Crear cuenta',
    authText: 'Empieza a compartir imagenes, seguir autores y construir tu coleccion personal.',
    authMode: 'register',
  });
}

function renderForgotPassword(req, res) {
  res.render('pages/forgot-password', {
    title: 'Recuperar contrasena | Fotaza 2',
    authTitle: 'Recupera el acceso a tu cuenta.',
    authEyebrow: 'Olvide mi contrasena',
    authText: 'Esta vista queda preparada para el flujo de recuperacion que conectaremos mas adelante.',
    authMode: 'forgot-password',
  });
}

module.exports = {
  renderLogin,
  renderRegister,
  renderForgotPassword,
};
