const express = require("express");
const {
  requerirAutenticacion,
  impedirInteraccionValidador,
} = require("../middlewares/autenticacionMiddleware");
const {
  mostrarPerfilUsuario,
  mostrarEditarPerfil,
  actualizarPerfil,
  seguirUsuario,
  dejarDeSeguirUsuario,
} = require("../controllers/usuarioController");

const router = express.Router();

router.get("/usuarios/:id/editar", requerirAutenticacion, impedirInteraccionValidador, mostrarEditarPerfil);

router.get("/usuarios/:id", impedirInteraccionValidador, mostrarPerfilUsuario);

router.put("/usuarios/:id", requerirAutenticacion, impedirInteraccionValidador, actualizarPerfil);

router.post("/usuarios/:id/seguir", requerirAutenticacion, impedirInteraccionValidador, seguirUsuario);

router.delete("/usuarios/:id/seguir", requerirAutenticacion, impedirInteraccionValidador, dejarDeSeguirUsuario);

module.exports = router;
