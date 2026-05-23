const { DataTypes } = require('sequelize');

function defineImageRating(sequelize) {
  return sequelize.define(
    'ImageRating',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imageId: {
        type: DataTypes.INTEGER,
        field: 'image_id',
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
    },
    {
      tableName: 'image_ratings',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['image_id', 'user_id'],
        },
      ],
    }
  );
}

module.exports = defineImageRating;
