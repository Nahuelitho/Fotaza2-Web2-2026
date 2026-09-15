const express = require('express');
const {
  mostrarColecciones,
  crearColeccion,
  mostrarColeccion,
  agregarPublicacion,
  quitarPublicacion,
} = require('../controllers/coleccionController');
const {
  requerirAutenticacion,
  impedirInteraccionValidador,
} = require('../middlewares/autenticacionMiddleware');

const router = express.Router();

router.get('/colecciones', requerirAutenticacion, impedirInteraccionValidador, mostrarColecciones);
router.post('/colecciones', requerirAutenticacion, impedirInteraccionValidador, crearColeccion);
router.get('/colecciones/:id', requerirAutenticacion, impedirInteraccionValidador, mostrarColeccion);
router.post(
  '/colecciones/publicaciones/:publicacionId',
  requerirAutenticacion,
  impedirInteraccionValidador,
  agregarPublicacion
);
router.delete(
  '/colecciones/:id/publicaciones/:publicacionId',
  requerirAutenticacion,
  impedirInteraccionValidador,
  quitarPublicacion
);

module.exports = router;
