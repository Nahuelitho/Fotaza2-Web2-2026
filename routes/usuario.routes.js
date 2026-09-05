const express = require("express");
const {
  requerirAutenticacion,
} = require("../middlewares/autenticacionMiddleware");
const {
  mostrarPerfilUsuario,
  mostrarEditarPerfil,
  actualizarPerfil,
  seguirUsuario,
  dejarDeSeguirUsuario,
} = require("../controllers/usuarioController");

const router = express.Router();

router.get("/usuarios/:id/editar", requerirAutenticacion, mostrarEditarPerfil);

router.get("/usuarios/:id", mostrarPerfilUsuario);

router.put("/usuarios/:id", requerirAutenticacion, actualizarPerfil);

router.post("/usuarios/:id/seguir", requerirAutenticacion, seguirUsuario);

router.delete("/usuarios/:id/seguir", requerirAutenticacion, dejarDeSeguirUsuario,);

module.exports = router;