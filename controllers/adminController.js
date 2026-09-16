const {
  sequelize,
  Etiqueta,
  PublicacionEtiqueta,
} = require('../models/sequelize');

async function mostrarEtiquetas(req, res) {
  const etiquetas = await Etiqueta.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM publicaciones_etiquetas pe
            WHERE pe.id_etiqueta = "Etiqueta"."id"
          )`),
          'cantidadPublicaciones',
        ],
      ],
    },
    order: [['name', 'ASC']],
  });

  return res.render('pages/admin-etiquetas', {
    title: 'Panel administrador | Fotaza 2',
    extraCss: ['/css/validador.css'],
    etiquetas,
    mensajeError: req.query.error || '',
    mensajeExito: req.query.exito || '',
  });
}

async function eliminarEtiqueta(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const etiqueta = await Etiqueta.findByPk(req.params.id, { transaction });

    if (!etiqueta) {
      await transaction.rollback();
      return res.redirect('/admin/etiquetas?error=La etiqueta no existe.');
    }

    await PublicacionEtiqueta.destroy({
      where: { idEtiqueta: etiqueta.id },
      transaction,
    });
    await etiqueta.destroy({ transaction });
    await transaction.commit();

    return res.redirect(
      `/admin/etiquetas?exito=${encodeURIComponent(`Etiqueta "${etiqueta.name}" eliminada.`)}`,
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { mostrarEtiquetas, eliminarEtiqueta };
