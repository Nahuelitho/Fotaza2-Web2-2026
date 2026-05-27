const { Op } = require('sequelize');
const { User, Role } = require('./sequelize');

async function buscarPorCorreo(correo) {
  return User.findOne({ where: { email: correo }, raw: true });
}

async function buscarPorUsuario(usuario) {
  return User.findOne({ where: { username: usuario }, raw: true });
}

async function buscarPorCorreoOUsuario(identificador) {
  return User.findOne({
    where: {
      [Op.or]: [{ email: identificador }, { username: identificador }],
    },
    raw: true,
  });
}

async function buscarIdRolPredeterminado() {
  const role = await Role.findOne({ where: { name: 'user' }, raw: true });
  return role?.id || null;
}

async function crearUsuario({ usuario, correo, hashContrasena, nombreVisible }) {
  const roleId = await buscarIdRolPredeterminado();

  if (!roleId) {
    throw new Error('No existe el rol base de usuario. Ejecuta npm run db:init.');
  }

  const user = await User.create({
    roleId,
    username: usuario,
    email: correo,
    passwordHash: hashContrasena,
    displayName: nombreVisible,
  });

  return {
    id: user.id,
    role_id: roleId,
    usuario,
    correo,
    nombre_visible: nombreVisible,
    is_active: 1,
  };
}

module.exports = {
  buscarPorCorreo,
  buscarPorUsuario,
  buscarPorCorreoOUsuario,
  crearUsuario,
};
