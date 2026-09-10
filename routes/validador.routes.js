const express = require("express");
const { requerirValidador } = require("../middlewares/validadorMiddleware");
const {
  mostrarPanelDenuncias,
  mostrarDetalleModeracion,
  desestimarDenuncias,
  darDeBajaPublicacion,
} = require("../controllers/validadorController");

const router = express.Router();

router.get(
  "/validador/denuncias",
  requerirValidador,
  mostrarPanelDenuncias,
);

router.get(
  "/validador/publicaciones/:id",
  requerirValidador,
  mostrarDetalleModeracion,
);

router.post(
  "/validador/publicaciones/:id/desestimar",
  requerirValidador,
  desestimarDenuncias,
);

router.post(
  "/validador/publicaciones/:id/dar-de-baja",
  requerirValidador,
  darDeBajaPublicacion,
);

module.exports = router;