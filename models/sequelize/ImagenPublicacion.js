const { DataTypes } = require('sequelize');

function definePostImage(sequelize) {
  return sequelize.define(
    'ImagenPublicacion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idPublicacion: {
        type: DataTypes.INTEGER,
        field: 'id_publicacion',
        allowNull: false,
      },
      tipoMime: {
        type: DataTypes.STRING(100),
        field: 'tipo_mime',
        allowNull: false,
      },
      imagenBase64: {
        type: DataTypes.TEXT,
        field: 'imagen_base64',
        allowNull: false,
      },
      tipoLicencia: {
        type: DataTypes.ENUM('con_copyright', 'creative_commons'),
        field: 'tipo_licencia',
        allowNull: false,
        defaultValue: 'con_copyright',
      },
      textoMarcaAgua: {
        type: DataTypes.STRING(100),
        field: 'texto_marca_agua',
        allowNull: true,
      },
    },
    {
      tableName: 'imagenes_publicacion',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );
}

module.exports = definePostImage;
