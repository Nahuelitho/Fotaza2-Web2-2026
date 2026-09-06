const { DataTypes } = require('sequelize');

function defineDenunciaPublicacion(sequelize) {
  return sequelize.define(
    'DenunciaPublicacion',
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
      motivo: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'desestimada', 'aceptada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
    },
    {
      tableName: 'denuncias_publicaciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['id_publicacion', 'id_usuario'],
        },
      ],
    }
  );
}

module.exports = defineDenunciaPublicacion;