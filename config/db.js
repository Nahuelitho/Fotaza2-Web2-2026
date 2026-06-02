const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const pg = require('pg')

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fotaza2',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    dialectModule: pg,
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
