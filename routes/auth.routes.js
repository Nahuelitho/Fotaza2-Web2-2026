const express = require('express');
const {
  mostrarInicioSesion,
  mostrarRegistro,
  mostrarRecuperarContrasena,
  registrarUsuario,
  iniciarSesionUsuario,
  cerrarSesionUsuario,
} = require('../controllers/authController');
const { requerirInvitado, requerirAutenticacion } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/iniciar-sesion', requerirInvitado, mostrarInicioSesion);
router.get('/registro', requerirInvitado, mostrarRegistro);
router.get('/recuperar-contrasena', mostrarRecuperarContrasena);
router.post('/iniciar-sesion', requerirInvitado, iniciarSesionUsuario);
router.post('/registro', requerirInvitado, registrarUsuario);
router.post('/cerrar-sesion', requerirAutenticacion, cerrarSesionUsuario);

module.exports = router;
