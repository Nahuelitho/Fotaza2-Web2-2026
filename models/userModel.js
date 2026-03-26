const { createPool } = require('../config/db');

const pool = createPool();

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, role_id, username, email, password_hash, display_name, is_active
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query(
    `SELECT id, role_id, username, email, password_hash, display_name, is_active
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [username]
  );

  return rows[0] || null;
}

async function findByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    `SELECT id, role_id, username, email, password_hash, display_name, is_active
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [identifier, identifier]
  );

  return rows[0] || null;
}

async function findDefaultRoleId() {
  const [rows] = await pool.query(
    `SELECT id
     FROM roles
     WHERE name = 'user'
     LIMIT 1`
  );

  return rows[0]?.id || null;
}

async function createUser({ username, email, passwordHash, displayName }) {
  const roleId = await findDefaultRoleId();

  if (!roleId) {
    throw new Error('No existe el rol base de usuario. Ejecuta npm run db:init.');
  }

  const [result] = await pool.query(
    `INSERT INTO users (role_id, username, email, password_hash, display_name)
     VALUES (?, ?, ?, ?, ?)`,
    [roleId, username, email, passwordHash, displayName]
  );

  return {
    id: result.insertId,
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
