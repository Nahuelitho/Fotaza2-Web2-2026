const { DataTypes } = require('sequelize');

function definePost(sequelize) {
  return sequelize.define(
    'Publicacion',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idUsuario: {
        type: DataTypes.INTEGER,
        field: 'id_usuario',
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      comentariosHabilitados: {
        type: DataTypes.BOOLEAN,
        field: 'comentarios_habilitados',
        allowNull: false,
        defaultValue: true,
      },
      visibilidad: {
        type: DataTypes.ENUM('publica', 'privada'),
        allowNull: false,
        defaultValue: 'publica',
      },
      estado: {
        type: DataTypes.ENUM('activa', 'reportada', 'en_revision', 'eliminada'),
        allowNull: false,
        defaultValue: 'activa',
      },
    },
    {
      tableName: 'publicaciones',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

module.exports = definePost;
