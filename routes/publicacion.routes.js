const express = require('express');
const multer = require('multer');
const {
  requerirAutenticacion,
  impedirPublicacionValidador,
} = require('../middlewares/autenticacionMiddleware');
const {
  crearPublicacion,
  mostrarDetallePublicacion,
  eliminarPublicacion,
  crearComentario,
  eliminarComentario,
  valorarPublicacion,
} = require('../controllers/publicacionController');

const { denunciarPublicacion } = require('../controllers/denunciaController');

const router = express.Router();

const TIPOS_MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    console.log('Archivo detectado por multer:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (!TIPOS_MIME_PERMITIDOS.includes(file.mimetype)) {
      return cb(new Error('TIPO_ARCHIVO_INVALIDO'));
    }

    cb(null, true);
  },
});

function manejarErrorUpload(req, res, next) {
  upload.single('imagen')(req, res, (error) => {
    if (error) {
      console.error('Error de multer al subir imagen:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.redirect(
          `/?error=${encodeURIComponent('La imagen supera el tamaño máximo permitido de 2MB.')}`
        );
      }

      if (error.message === 'TIPO_ARCHIVO_INVALIDO') {
        return res.redirect(
          `/?error=${encodeURIComponent('La imagen debe ser JPG, PNG o WEBP.')}`
        );
      }

      return res.redirect(
        `/?error=${encodeURIComponent('No se pudo procesar la imagen.')}`
      );
    }

    console.log('Resultado final de multer:', {
      existeArchivo: !!req.file,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      tieneBuffer: !!req.file?.buffer,
    });

    return next();
  });
}

router.get('/publicaciones/:id', mostrarDetallePublicacion);

router.delete(
  '/publicaciones/:id',
  requerirAutenticacion,
  eliminarPublicacion
);

router.post(
  '/publicaciones',
  requerirAutenticacion,
  impedirPublicacionValidador,
  manejarErrorUpload,
  crearPublicacion
);

router.post(
  '/publicaciones/:id/comentarios',
  requerirAutenticacion,
  crearComentario
);

router.post(
  '/publicaciones/:id/valoraciones',
  requerirAutenticacion,
  valorarPublicacion
);

router.post(
  '/publicaciones/:id/denuncias',
  requerirAutenticacion,
  denunciarPublicacion
);

router.delete(
  '/publicaciones/:id/comentarios/:comentarioId',
  requerirAutenticacion,
  eliminarComentario
);

module.exports = router;