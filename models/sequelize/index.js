const { sequelize } = require('../../config/db');
const defineRole = require('./Role');
const defineUser = require('./User');
const defineTag = require('./Tag');
const definePost = require('./Post');
const definePostImage = require('./PostImage');
const defineComment = require('./Comment');
const defineImageRating = require('./ImageRating');
const defineFollow = require('./Follow');
const definePostTag = require('./PostTag');

const Role = defineRole(sequelize);
const User = defineUser(sequelize);
const Tag = defineTag(sequelize);
const Post = definePost(sequelize);
const PostImage = definePostImage(sequelize);
const Comment = defineComment(sequelize);
const ImageRating = defineImageRating(sequelize);
const Follow = defineFollow(sequelize);
const PostTag = definePostTag(sequelize);

Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'RESTRICT' });
User.belongsTo(Role, { foreignKey: 'roleId', onDelete: 'RESTRICT' });

User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

Post.hasMany(PostImage, { foreignKey: 'postId', onDelete: 'CASCADE' });
PostImage.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });

Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'postId', otherKey: 'tagId' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tagId', otherKey: 'postId' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', onDelete: 'CASCADE' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

PostImage.hasMany(ImageRating, { foreignKey: 'imageId', onDelete: 'CASCADE' });
ImageRating.belongsTo(PostImage, { foreignKey: 'imageId', onDelete: 'CASCADE' });

User.hasMany(ImageRating, { foreignKey: 'userId', onDelete: 'CASCADE' });
ImageRating.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.belongsToMany(User, {
  as: 'Following',
  through: Follow,
  foreignKey: 'followerId',
  otherKey: 'followedId',
});

User.belongsToMany(User, {
  as: 'Followers',
  through: Follow,
  foreignKey: 'followedId',
  otherKey: 'followerId',
});

module.exports = {
  sequelize,
  Role,
  User,
  Tag,
  Post,
  PostImage,
  PostTag,
  Comment,
  ImageRating,
  Follow,
};
