const express = require('express');
const {
  renderizarInicio,
  renderizarPublicacionesSeguidas,
} = require('../controllers/inicioController');
const {
  requerirAutenticacion,
  impedirInteraccionValidador,
} = require('../middlewares/autenticacionMiddleware');

const router = express.Router();

router.get('/', renderizarInicio);
router.get('/siguiendo', requerirAutenticacion, impedirInteraccionValidador, renderizarPublicacionesSeguidas);

module.exports = router;
