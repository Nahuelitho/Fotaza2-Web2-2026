const { DataTypes } = require("sequelize");

function definirNotificacion(sequelize) {
  return sequelize.define(
    "Notificacion",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      idUsuario: {
        type: DataTypes.INTEGER,
        field: "id_usuario",
        allowNull: false,
      },

      idActor: {
        type: DataTypes.INTEGER,
        field: "id_actor",
        allowNull: false,
      },

      idPublicacion: {
        type: DataTypes.INTEGER,
        field: "id_publicacion",
        allowNull: true,
      },

      tipo: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      mensaje: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      leida: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "notificaciones",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
}

module.exports = definirNotificacion;