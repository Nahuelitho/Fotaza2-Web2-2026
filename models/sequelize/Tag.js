const { DataTypes } = require('sequelize');

function defineTag(sequelize) {
  return sequelize.define(
    'Tag',
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
      tableName: 'tags',
      underscored: true,
      timestamps: false,
    }
  );
}

module.exports = defineTag;
