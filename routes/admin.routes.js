const express = require('express');
const { requerirAdmin } = require('../middlewares/adminMiddleware');
const {
  mostrarEtiquetas,
  eliminarEtiqueta,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/admin/etiquetas', requerirAdmin, mostrarEtiquetas);
router.delete('/admin/etiquetas/:id', requerirAdmin, eliminarEtiqueta);

module.exports = router;
