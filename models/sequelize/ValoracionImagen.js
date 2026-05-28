const { DataTypes } = require('sequelize');

function defineImageRating(sequelize) {
  return sequelize.define(
    'ValoracionImagen',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idImagen: {
        type: DataTypes.INTEGER,
        field: 'id_imagen',
        allowNull: false,
      },
      idUsuario: {
        type: DataTypes.INTEGER,
        field: 'id_usuario',
        allowNull: false,
      },
      puntaje: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
    },
    {
      tableName: 'valoraciones_imagen',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          unique: true,
           fields: ['id_imagen', 'id_usuario'],
        },
      ],
    }
  );
}

module.exports = defineImageRating;
