const express = require('express');
const {
  renderizarInicio,
  renderizarPublicacionesSeguidas,
} = require('../controllers/inicioController');
const {
  requerirAutenticacion,
} = require('../middlewares/autenticacionMiddleware');

const router = express.Router();

router.get('/', renderizarInicio);
router.get('/siguiendo', requerirAutenticacion, renderizarPublicacionesSeguidas);

module.exports = router;
