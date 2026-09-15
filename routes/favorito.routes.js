const express = require('express');
const {
  agregarFavorito,
  quitarFavorito,
  mostrarFavoritos,
} = require('../controllers/favoritoController');
const {
  requerirAutenticacion,
  impedirInteraccionValidador,
} = require('../middlewares/autenticacionMiddleware');

const router = express.Router();

router.get('/favoritos', requerirAutenticacion, impedirInteraccionValidador, mostrarFavoritos);
router.post('/publicaciones/:id/favorito', requerirAutenticacion, impedirInteraccionValidador, agregarFavorito);
router.delete('/publicaciones/:id/favorito', requerirAutenticacion, impedirInteraccionValidador, quitarFavorito);

module.exports = router;
