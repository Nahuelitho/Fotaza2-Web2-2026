const express = require('express');
const { renderizarInicio } = require('../controllers/inicioController');

const router = express.Router();

router.get('/', renderizarInicio);

module.exports = router;
