const mysql = require('mysql2/promise');

function getDbConfig(includeDatabase = true) {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  if (includeDatabase) {
    config.database = process.env.DB_NAME || 'fotaza2';
  }

  return config;
}

function createPool() {
  return mysql.createPool(getDbConfig(true));
}

async function checkDbConnection() {
  const connection = await mysql.createConnection(getDbConfig(true));

  try {
    await connection.query('SELECT 1');
  } finally {
    await connection.end();
  }
}

module.exports = {
  createPool,
  getDbConfig,
  checkDbConnection,
};
