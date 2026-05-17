function renderHome(req, res) {
  res.render('pages/home', {
    title: 'Fotaza 2',
    currentUser: req.session.user || null,
    featuredTags: ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'],
    quickLinks: ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'],
  });
}

module.exports = {
  renderHome,
};
