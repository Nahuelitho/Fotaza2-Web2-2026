const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, Tag } = require('../models/sequelize');

dotenv.config({ quiet: true });

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Faltan variables de entorno: ${missingEnv.join(', ')}`);
  console.error('Copia .env.example a .env y completa los datos antes de ejecutar db:init.');
  process.exit(1);
}

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || '123456';

async function run() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const roles = ['admin', 'validator', 'user'];
  for (const name of roles) {
    await Role.findOrCreate({ where: { name }, defaults: { name } });
  }

  const userRole = await Role.findOne({ where: { name: 'user' } });
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  const validatorRole = await Role.findOne({ where: { name: 'validator' } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const seedUsers = [
    {
      username: 'admin',
      email: 'admin@fotaza.local',
      displayName: 'Admin Fotaza',
      roleId: adminRole.id,
    },
    {
      username: 'validator',
      email: 'validator@fotaza.local',
      displayName: 'Validador Fotaza',
      roleId: validatorRole.id,
    },
    {
      username: 'demo',
      email: 'demo@fotaza.local',
      displayName: 'Usuario Demo',
      roleId: userRole.id,
    },
  ];

  for (const seedUser of seedUsers) {
    await User.findOrCreate({
      where: { username: seedUser.username },
      defaults: {
        roleId: seedUser.roleId,
        username: seedUser.username,
        email: seedUser.email,
        passwordHash,
        displayName: seedUser.displayName,
      },
    });
  }

  const tags = ['paisaje', 'retrato', 'urbano', 'naturaleza', 'viajes'];
  for (const name of tags) {
    await Tag.findOrCreate({ where: { name }, defaults: { name } });
  }

  console.log(`Base de datos '${process.env.DB_NAME}' inicializada correctamente en PostgreSQL.`);
}

run().catch((error) => {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exit(1);
});
