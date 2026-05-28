const { DataTypes } = require('sequelize');

function definePostTag(sequelize) {
  return sequelize.define(
    'PublicacionEtiqueta',
    {
      idPublicacion: {
        type: DataTypes.INTEGER,
        field: 'id_publicacion',
        allowNull: false,
        primaryKey: true,
      },
      idEtiqueta: {
        type: DataTypes.INTEGER,
        field: 'id_etiqueta',
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'publicaciones_etiquetas',
      underscored: true,
      timestamps: false,
    }
  );
}

module.exports = definePostTag;
