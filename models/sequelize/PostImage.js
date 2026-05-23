const { DataTypes } = require('sequelize');

function definePostImage(sequelize) {
  return sequelize.define(
    'PostImage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      postId: {
        type: DataTypes.INTEGER,
        field: 'post_id',
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING(100),
        field: 'mime_type',
        allowNull: false,
      },
      imageBase64: {
        type: DataTypes.TEXT,
        field: 'image_base64',
        allowNull: false,
      },
      licenseType: {
        type: DataTypes.ENUM('copyright', 'creative_commons'),
        field: 'license_type',
        allowNull: false,
        defaultValue: 'copyright',
      },
      watermarkText: {
        type: DataTypes.STRING(100),
        field: 'watermark_text',
        allowNull: true,
      },
    },
    {
      tableName: 'post_images',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}

module.exports = definePostImage;
