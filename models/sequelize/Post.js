const { DataTypes } = require('sequelize');

function definePost(sequelize) {
  return sequelize.define(
    'Post',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      commentsEnabled: {
        type: DataTypes.BOOLEAN,
        field: 'comments_enabled',
        allowNull: false,
        defaultValue: true,
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
      },
      status: {
        type: DataTypes.ENUM('active', 'reported', 'under_review', 'removed'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'posts',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

module.exports = definePost;
