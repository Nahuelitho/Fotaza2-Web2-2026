const dotenv = require('dotenv');
const { Client } = require('pg');
const { sequelize, Rol, Etiqueta } = require('../models/sequelize');

dotenv.config({ quiet: true });

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Faltan variables de entorno: ${missingEnv.join(', ')}`);
  console.error('Copia .env.example a .env y completa los datos antes de ejecutar db:init.');
  process.exit(1);
}

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: 'postgres',
  });

  await adminClient.connect();

  try {
    const dbName = process.env.DB_NAME;
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error('DB_NAME invalido. Usa solo letras, numeros y guion bajo.');
    }
    const existing = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (existing.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base de datos '${dbName}' creada.`);
    }
  } finally {
    await adminClient.end();
  }
}

async function run() {
  await ensureDatabaseExists();
  await sequelize.authenticate();
  await sequelize.sync();

  const roles = ['admin', 'validador', 'usuario'];
  for (const nombreRol of roles) {
    await Rol.findOrCreate({ where: { name: nombreRol }, defaults: { name: nombreRol } });
  }

  const rolUsuario = await Rol.findOne({ where: { name: 'usuario' } });

  if (!rolUsuario) {
    throw new Error('No se pudo crear o encontrar el rol base usuario.');
  }

  const etiquetas = ['paisaje', 'retrato', 'urbano', 'naturaleza', 'viajes'];
  for (const nombreEtiqueta of etiquetas) {
    await Etiqueta.findOrCreate({ where: { name: nombreEtiqueta }, defaults: { name: nombreEtiqueta } });
  }

  console.log(`Base de datos '${process.env.DB_NAME}' inicializada correctamente en PostgreSQL.`);
}

run().catch((error) => {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exit(1);
});
