const express = require('express');
const { renderizarInicio } = require('../controllers/homeController');

const router = express.Router();

router.get('/', renderizarInicio);

module.exports = router;
