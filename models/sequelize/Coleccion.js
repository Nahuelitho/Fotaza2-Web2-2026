const { DataTypes } = require('sequelize');

function definirColeccion(sequelize) {
  return sequelize.define(
    'Coleccion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idUsuario: {
        type: DataTypes.INTEGER,
        field: 'id_usuario',
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
    },
    {
      tableName: 'colecciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['id_usuario', 'nombre'],
        },
      ],
    }
  );
}

module.exports = definirColeccion;
