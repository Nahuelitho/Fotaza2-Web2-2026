const express = require('express');
const multer = require('multer');
const { requerirAutenticacion } = require('../middlewares/autenticacionMiddleware');
const { crearPublicacion, mostrarDetallePublicacion, eliminarPublicacion, crearComentario, valorarPublicacion } = require('../controllers/publicacionController');

const router = express.Router();

router.get('/publicaciones/:id', mostrarDetallePublicacion);
router.delete('/publicaciones/:id', requerirAutenticacion, eliminarPublicacion);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post('/publicaciones', requerirAutenticacion, (req, res, next) => {
  upload.single('imagen')(req, res, (error) => {
    if (error) {
      return res.redirect('/?error=La imagen supera el tamano maximo permitido (2MB).');
    }

    return next();
  });
}, crearPublicacion);

router.post('/publicaciones/:id/comentarios', requerirAutenticacion, crearComentario);
router.post('/publicaciones/:id/valoraciones', requerirAutenticacion, valorarPublicacion);

module.exports = router;
