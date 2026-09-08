const express = require('express');
const { requerirValidador } = require('../middlewares/validadorMiddleware');
const {
  mostrarPanelDenuncias,
} = require('../controllers/validadorController');

const router = express.Router();

router.get('/validador/denuncias', requerirValidador, mostrarPanelDenuncias);

module.exports = router;