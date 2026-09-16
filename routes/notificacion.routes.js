const express = require("express");

const {
  listarNotificaciones,
  marcarTodasLeidas,
} = require("../controllers/notificacionController");

const router = express.Router();

function requiereSesion(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.redirect("/iniciar-sesion");
  }

  next();
}

router.get("/", requiereSesion, listarNotificaciones);

router.post(
  "/marcar-todas-leidas",
  requiereSesion,
  marcarTodasLeidas,
);

module.exports = router;