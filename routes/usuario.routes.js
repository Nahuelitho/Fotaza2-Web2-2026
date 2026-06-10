const express = require('express');
const { requerirAutenticacion } = require('../middlewares/autenticacionMiddleware');
const {
  mostrarPerfilUsuario,
  seguirUsuario,
  dejarDeSeguirUsuario,
} = require('../controllers/usuarioController');

const router = express.Router();

router.get('/usuarios/:id', mostrarPerfilUsuario);

router.post('/usuarios/:id/seguir', requerirAutenticacion, seguirUsuario);

router.delete('/usuarios/:id/seguir', requerirAutenticacion, dejarDeSeguirUsuario);

module.exports = router;