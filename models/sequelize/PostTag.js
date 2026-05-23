const { DataTypes } = require('sequelize');

function definePostTag(sequelize) {
  return sequelize.define(
    'PostTag',
    {
      postId: {
        type: DataTypes.INTEGER,
        field: 'post_id',
        allowNull: false,
        primaryKey: true,
      },
      tagId: {
        type: DataTypes.INTEGER,
        field: 'tag_id',
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'post_tags',
      underscored: true,
      timestamps: false,
    }
  );
}

module.exports = definePostTag;
