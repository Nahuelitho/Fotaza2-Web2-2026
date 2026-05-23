const { Op } = require('sequelize');
const { User, Role } = require('./sequelize');

async function findByEmail(email) {
  return User.findOne({ where: { email }, raw: true });
}

async function findByUsername(username) {
  return User.findOne({ where: { username }, raw: true });
}

async function findByEmailOrUsername(identifier) {
  return User.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { username: identifier }],
    },
    raw: true,
  });
}

async function findDefaultRoleId() {
  const role = await Role.findOne({ where: { name: 'user' }, raw: true });
  return role?.id || null;
}

async function createUser({ username, email, passwordHash, displayName }) {
  const roleId = await findDefaultRoleId();

  if (!roleId) {
    throw new Error('No existe el rol base de usuario. Ejecuta npm run db:init.');
  }

  const user = await User.create({
    roleId,
    username,
    email,
    passwordHash,
    displayName,
  });

  return {
    id: user.id,
    role_id: roleId,
    username,
    email,
    display_name: displayName,
    is_active: 1,
  };
}

module.exports = {
  findByEmail,
  findByUsername,
  findByEmailOrUsername,
  createUser,
};
