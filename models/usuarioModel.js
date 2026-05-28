const { Op } = require('sequelize');
const { Usuario, Rol } = require('./sequelize');

async function buscarPorCorreo(correo) {
  return Usuario.findOne({ where: { correo }, raw: true });
}

async function buscarPorUsuario(usuario) {
  return Usuario.findOne({ where: { nombreUsuario: usuario }, raw: true });
}

async function buscarPorCorreoOUsuario(identificador) {
  return Usuario.findOne({
    where: {
      [Op.or]: [{ correo: identificador }, { nombreUsuario: identificador }],
    },
    raw: true,
  });
}

async function buscarIdRolPredeterminado() {
  const rol = await Rol.findOne({ where: { name: 'usuario' }, raw: true });
  return rol?.id || null;
}

async function crearUsuario({ usuario, correo, hashContrasena, nombreVisible }) {
  const roleId = await buscarIdRolPredeterminado();

  if (!roleId) {
    throw new Error('No existe el rol base de usuario. Ejecuta npm run db:init.');
  }

  const usuarioCreado = await Usuario.create({
    idRol: roleId,
    nombreUsuario: usuario,
    correo,
    hashContrasena,
    nombreVisible,
  });

  return {
    id: usuarioCreado.id,
    role_id: roleId,
    usuario,
    correo,
    nombre_visible: nombreVisible,
    esta_activo: 1,
  };
}

module.exports = {
  buscarPorCorreo,
  buscarPorUsuario,
  buscarPorCorreoOUsuario,
  crearUsuario,
};
