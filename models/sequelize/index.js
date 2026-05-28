const { sequelize } = require('../../config/db');
const definirRol = require('./Rol');
const definirUsuario = require('./Usuario');
const definirEtiqueta = require('./Etiqueta');
const definirPublicacion = require('./Publicacion');
const definirImagenPublicacion = require('./ImagenPublicacion');
const definirComentario = require('./Comentario');
const definirValoracionImagen = require('./ValoracionImagen');
const definirSeguimiento = require('./Seguimiento');
const definirPublicacionEtiqueta = require('./PublicacionEtiqueta');

const Rol = definirRol(sequelize);
const Usuario = definirUsuario(sequelize);
const Etiqueta = definirEtiqueta(sequelize);
const Publicacion = definirPublicacion(sequelize);
const ImagenPublicacion = definirImagenPublicacion(sequelize);
const Comentario = definirComentario(sequelize);
const ValoracionImagen = definirValoracionImagen(sequelize);
const Seguimiento = definirSeguimiento(sequelize);
const PublicacionEtiqueta = definirPublicacionEtiqueta(sequelize);

Rol.hasMany(Usuario, { as: 'usuarios', foreignKey: 'idRol', onDelete: 'RESTRICT' });
Usuario.belongsTo(Rol, { as: 'rol', foreignKey: 'idRol', onDelete: 'RESTRICT' });

Usuario.hasMany(Publicacion, { as: 'publicaciones', foreignKey: 'idUsuario', onDelete: 'CASCADE' });
Publicacion.belongsTo(Usuario, { as: 'usuario', foreignKey: 'idUsuario', onDelete: 'CASCADE' });

Publicacion.hasMany(ImagenPublicacion, { as: 'imagenes', foreignKey: 'idPublicacion', onDelete: 'CASCADE' });
ImagenPublicacion.belongsTo(Publicacion, { as: 'publicacion', foreignKey: 'idPublicacion', onDelete: 'CASCADE' });

Publicacion.belongsToMany(Etiqueta, {
  as: 'etiquetas',
  through: PublicacionEtiqueta,
  foreignKey: 'idPublicacion',
  otherKey: 'idEtiqueta',
});
Etiqueta.belongsToMany(Publicacion, {
  as: 'publicaciones',
  through: PublicacionEtiqueta,
  foreignKey: 'idEtiqueta',
  otherKey: 'idPublicacion',
});

Publicacion.hasMany(Comentario, { as: 'comentarios', foreignKey: 'idPublicacion', onDelete: 'CASCADE' });
Comentario.belongsTo(Publicacion, { as: 'publicacion', foreignKey: 'idPublicacion', onDelete: 'CASCADE' });

Usuario.hasMany(Comentario, { as: 'comentarios', foreignKey: 'idUsuario', onDelete: 'CASCADE' });
Comentario.belongsTo(Usuario, { as: 'usuario', foreignKey: 'idUsuario', onDelete: 'CASCADE' });

ImagenPublicacion.hasMany(ValoracionImagen, { as: 'valoraciones', foreignKey: 'idImagen', onDelete: 'CASCADE' });
ValoracionImagen.belongsTo(ImagenPublicacion, { as: 'imagen', foreignKey: 'idImagen', onDelete: 'CASCADE' });

Usuario.hasMany(ValoracionImagen, { as: 'valoracionesImagen', foreignKey: 'idUsuario', onDelete: 'CASCADE' });
ValoracionImagen.belongsTo(Usuario, { as: 'usuario', foreignKey: 'idUsuario', onDelete: 'CASCADE' });

Usuario.belongsToMany(Usuario, {
  as: 'seguidos',
  through: Seguimiento,
  foreignKey: 'idSeguidor',
  otherKey: 'idSeguido',
});

Usuario.belongsToMany(Usuario, {
  as: 'seguidores',
  through: Seguimiento,
  foreignKey: 'idSeguido',
  otherKey: 'idSeguidor',
});

module.exports = {
  sequelize,
  Rol,
  Usuario,
  Etiqueta,
  Publicacion,
  ImagenPublicacion,
  PublicacionEtiqueta,
  Comentario,
  ValoracionImagen,
  Seguimiento,
};
