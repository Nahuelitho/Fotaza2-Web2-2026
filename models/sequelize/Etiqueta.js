const { DataTypes } = require('sequelize');

function defineTag(sequelize) {
  return sequelize.define(
    'Etiqueta',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'etiquetas',
      underscored: true,
      timestamps: false,
    }
  );
}

module.exports = defineTag;
