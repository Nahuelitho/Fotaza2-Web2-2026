const express = require('express');
const multer = require('multer');
const { requerirAutenticacion } = require('../middlewares/autenticacionMiddleware');
const { crearPublicacion } = require('../controllers/publicacionController');

const router = express.Router();

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

module.exports = router;
