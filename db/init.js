const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Faltan variables de entorno: ${missingEnv.join(', ')}`);
  console.error('Copia .env.example a .env y completa los datos antes de ejecutar db:init.');
  process.exit(1);
}

function loadSqlStatements(fileName) {
  const filePath = path.join(__dirname, fileName);
  const content = fs.readFileSync(filePath, 'utf8');

  return content
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const dbName = process.env.DB_NAME;

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);

    const schemaStatements = loadSqlStatements('schema.sql');
    for (const statement of schemaStatements) {
      await connection.query(statement);
    }

    const seedStatements = loadSqlStatements('seed.sql');
    for (const statement of seedStatements) {
      await connection.query(statement);
    }

    console.log(`Base de datos '${dbName}' inicializada correctamente.`);
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exit(1);
});
