function renderHome(req, res) {
  res.render('pages/home', {
    title: 'Fotaza 2',
    currentUser: req.session.user || null,
    featuredTags: ['Paisajes', 'Retratos', 'Ciudad', 'Viajes', 'Naturaleza'],
    quickLinks: ['Explorar', 'Tendencias', 'Colecciones', 'Fotografos', 'Favoritos'],
    posts: [
      {
        author: 'Luna Herrera',
        handle: '@lunaframe',
        location: 'San Luis, Argentina',
        title: 'Luz dorada en las sierras',
        description: 'Una serie pensada para el feed principal, con tonos calidos y aire de comunidad creativa.',
        imageLabel: 'Paisaje editorial',
        stats: '148 me gusta · 23 comentarios',
        tags: ['Paisaje', 'Golden hour'],
      },
      {
        author: 'Tomi Acosta',
        handle: '@tomiurbano',
        location: 'Villa Mercedes',
        title: 'Detalles urbanos al caer la tarde',
        description: 'Mockup del tipo de publicacion que despues va a nutrir el home con imagen, comentarios y valoraciones.',
        imageLabel: 'Serie urbana',
        stats: '97 me gusta · 14 comentarios',
        tags: ['Ciudad', 'Arquitectura'],
      },
      {
        author: 'Mara Sosa',
        handle: '@mara.retrata',
        location: 'Merlo',
        title: 'Retratos con fondo arena y luz suave',
        description: 'Pensado para mostrar una tarjeta reutilizable de post con botones de interaccion y guardado.',
        imageLabel: 'Retrato natural',
        stats: '203 me gusta · 31 comentarios',
        tags: ['Retrato', 'Editorial'],
      },
    ],
  });
}

module.exports = {
  renderHome,
};
