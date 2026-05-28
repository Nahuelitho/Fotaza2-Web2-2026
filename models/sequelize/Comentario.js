const { DataTypes } = require('sequelize');

function defineComment(sequelize) {
  return sequelize.define(
    'Comentario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idPublicacion: {
        type: DataTypes.INTEGER,
        field: 'id_publicacion',
        allowNull: false,
      },
      idUsuario: {
        type: DataTypes.INTEGER,
        field: 'id_usuario',
        allowNull: false,
      },
      contenido: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'comentarios',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}

module.exports = defineComment;
