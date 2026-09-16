const { DataTypes } = require('sequelize');

function definirFavorito(sequelize) {
  return sequelize.define(
    'Favorito',
    {
      idUsuario: {
        type: DataTypes.INTEGER,
        field: 'id_usuario',
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
      tableName: 'favoritos',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}

module.exports = definirFavorito;
