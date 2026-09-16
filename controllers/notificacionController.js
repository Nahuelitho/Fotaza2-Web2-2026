const {
  Notificacion,
  Usuario,
  Publicacion,
} = require("../models/sequelize");

async function listarNotificaciones(req, res) {
  const idUsuario = Number(req.session.usuario.id);

  const notificaciones = await Notificacion.findAll({
    where: {
      idUsuario,
    },
    include: [
      {
        model: Usuario,
        as: "actor",
        attributes: ["id", "nombreVisible", "nombreUsuario"],
      },
      {
        model: Publicacion,
        as: "publicacion",
        attributes: ["id", "titulo"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return res.render("pages/notificaciones", {
    title: "Notificaciones | Fotaza 2",
    notificaciones,
  });
}

async function marcarTodasLeidas(req, res) {
  const idUsuario = Number(req.session.usuario.id);

  await Notificacion.update(
    { leida: true },
    {
      where: {
        idUsuario,
        leida: false,
      },
    },
  );

  return res.redirect("/notificaciones");
}

module.exports = {
  listarNotificaciones,
  marcarTodasLeidas,
};