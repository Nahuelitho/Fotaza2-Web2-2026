const { DataTypes } = require('sequelize');

function definirColeccionPublicacion(sequelize) {
  return sequelize.define(
    'ColeccionPublicacion',
    {
      idColeccion: {
        type: DataTypes.INTEGER,
        field: 'id_coleccion',
        allowNull: false,
        primaryKey: true,
      },
      idPublicacion: {
        type: DataTypes.INTEGER,
        field: 'id_publicacion',
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'colecciones_publicaciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}

module.exports = definirColeccionPublicacion;
