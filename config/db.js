const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const pg = require('pg');

dotenv.config();

const usarSSL = process.env.DB_SSL === 'true' || process.env.VERCEL === '1';
const sslConn = usarSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : undefined;

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;
const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'fotaza2';
const dbUser = process.env.DB_USER || process.env.PGUSER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || process.env.PGPASSWORD || '';
const dbHost = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.PGPORT || 5432);

const sequelizeOptions = {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: sslConn,
  pool: {
    max: 1,
    min: 0,
    acquire: 10000,
    idle: 1000,
  },
  logging: false,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, sequelizeOptions)
  : new Sequelize(dbName, dbUser, dbPassword, {
      ...sequelizeOptions,
      host: dbHost,
      port: dbPort,
    });

async function checkDbConnection() {
  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  checkDbConnection,
};
