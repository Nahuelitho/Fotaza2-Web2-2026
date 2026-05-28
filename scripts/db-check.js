const { sequelize } = require('../models/sequelize');

const TABLES = [
  'roles',
  'usuarios',
  'etiquetas',
  'publicaciones',
  'imagenes_publicacion',
  'publicaciones_etiquetas',
  'comentarios',
  'valoraciones_imagen',
  'seguimientos',
];

async function run() {
  await sequelize.authenticate();

  for (const table of TABLES) {
    const [rows] = await sequelize.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
    console.log(`${table}: ${rows[0].c}`);
  }

  const [columns] = await sequelize.query(`
    SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('roles','usuarios','etiquetas','publicaciones','imagenes_publicacion','publicaciones_etiquetas','comentarios','valoraciones_imagen','seguimientos')
    ORDER BY table_name, ordinal_position
  `);

  console.log(`columns: ${columns.length}`);
}

run()
  .catch((error) => {
    console.error('DB check failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
