const { DataTypes } = require('sequelize');

function defineFollow(sequelize) {
  return sequelize.define(
    'Seguimiento',
    {
      idSeguidor: {
        type: DataTypes.INTEGER,
        field: 'id_seguidor',
        allowNull: false,
        primaryKey: true,
      },
      idSeguido: {
        type: DataTypes.INTEGER,
        field: 'id_seguido',
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: 'seguimientos',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
      validate: {
        notSelfFollow() {
          if (this.idSeguidor === this.idSeguido) {
            throw new Error('Un usuario no puede seguirse a si mismo.');
          }
        },
      },
    }
  );
}

module.exports = defineFollow;
