const express = require('express');
<<<<<<< HEAD
const { renderizarInicio, renderizarSeguidos } = require('../controllers/inicioController');
const { requerirAutenticacion } = require('../middlewares/autenticacionMiddleware');
=======
const {
  renderizarInicio,
  renderizarPublicacionesSeguidas,
} = require('../controllers/inicioController');
const {
  requerirAutenticacion,
  impedirInteraccionValidador,
} = require('../middlewares/autenticacionMiddleware');
>>>>>>> devNahu

const router = express.Router();

router.get('/', renderizarInicio);
<<<<<<< HEAD
router.get('/seguidos', requerirAutenticacion, renderizarSeguidos);
=======
router.get('/siguiendo', requerirAutenticacion, impedirInteraccionValidador, renderizarPublicacionesSeguidas);
>>>>>>> devNahu

module.exports = router;
