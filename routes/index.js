const express = require('express');
const { renderizarInicio, renderizarSeguidos } = require('../controllers/inicioController');
const { requerirAutenticacion } = require('../middlewares/autenticacionMiddleware');

const router = express.Router();

router.get('/', renderizarInicio);
router.get('/seguidos', requerirAutenticacion, renderizarSeguidos);

module.exports = router;
