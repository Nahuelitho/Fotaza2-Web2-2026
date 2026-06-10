const express = require('express');
const { mostrarPerfilUsuario } = require('../controllers/usuarioController');

const router = express.Router();

router.get('/usuarios/:id', mostrarPerfilUsuario);

module.exports = router;
