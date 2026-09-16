const { DataTypes } = require("sequelize");

function definirDenunciaComentario(sequelize) {
  return sequelize.define(
    "DenunciaComentario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      idComentario: {
        type: DataTypes.INTEGER,
        field: "id_comentario",
        allowNull: false,
      },

      idUsuario: {
        type: DataTypes.INTEGER,
        field: "id_usuario",
        allowNull: false,
      },

      motivo: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      estado: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "pendiente",
      },
    },
    {
      tableName: "denuncias_comentarios",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
}

module.exports = definirDenunciaComentario;