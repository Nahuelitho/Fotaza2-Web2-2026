const { DataTypes } = require('sequelize');

function defineUser(sequelize) {
  return sequelize.define(
    'Usuario',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idRol: {
        type: DataTypes.INTEGER,
        field: 'id_rol',
        allowNull: false,
      },
      nombreUsuario: {
        type: DataTypes.STRING(50),
        field: 'nombre_usuario',
        allowNull: false,
        unique: true,
      },
      correo: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      hashContrasena: {
        type: DataTypes.STRING(255),
        field: 'hash_contrasena',
        allowNull: false,
      },
      nombreVisible: {
        type: DataTypes.STRING(100),
        field: 'nombre_visible',
        allowNull: false,
      },
      biografia: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      urlAvatar: {
        type: DataTypes.STRING(255),
        field: 'url_avatar',
        allowNull: true,
      },
      estaActivo: {
        type: DataTypes.BOOLEAN,
        field: 'esta_activo',
        allowNull: false,
        defaultValue: true,
      },
      cantidadPublicacionesEliminadas: {
        type: DataTypes.INTEGER,
        field: 'cantidad_publicaciones_eliminadas',
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'usuarios',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}

module.exports = defineUser;
