const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const pg = require('pg');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const usarSSL = process.env.DB_SSL === 'true';

if (isProduction) {
  const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Falta la variable de entorno: ${key}`);
    }
  });
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fotaza2',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: usarSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    logging: false,
  }
);

async function checkDbConnection() {
  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  checkDbConnection,
};
