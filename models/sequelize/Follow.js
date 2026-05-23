const { DataTypes } = require('sequelize');

function defineFollow(sequelize) {
  return sequelize.define(
    'Follow',
    {
      followerId: {
        type: DataTypes.INTEGER,
        field: 'follower_id',
        allowNull: false,
        primaryKey: true,
      },
      followedId: {
        type: DataTypes.INTEGER,
        field: 'followed_id',
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'follows',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      validate: {
        notSelfFollow() {
          if (this.followerId === this.followedId) {
            throw new Error('Un usuario no puede seguirse a si mismo.');
          }
        },
      },
    }
  );
}

module.exports = defineFollow;
