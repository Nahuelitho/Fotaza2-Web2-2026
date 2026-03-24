function renderHome(req, res) {
  res.render('pages/home', {
    title: 'Fotaza 2',
    pageTitle: 'Fotaza 2',
    currentUser: req.session.user || null,
  });
}

module.exports = {
  renderHome,
};
