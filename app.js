const path = require('path');
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, Rol, Etiqueta, Usuario } = require('./models/sequelize');

dotenv.config({ quiet: true });

const indexRouter = require('./routes');
const authRouter = require('./routes/autenticacion.routes');
const postRouter = require('./routes/publicacion.routes');
const usuarioRouter = require('./routes/usuario.routes');

const app = express();
const port = Number(process.env.PORT || 3000);
const duracionSesion = 5 * 60 * 1000;

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sesiones',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: duracionSesion,
});

async function inicializarBaseDatos() {
  await sequelize.authenticate();

  await sequelize.sync();

  await sessionStore.sync();

  const roles = ['admin', 'validador', 'usuario'];

  for (const nombreRol of roles) {
    await Rol.findOrCreate({
      where: { name: nombreRol },
      defaults: { name: nombreRol },
    });
  }

  const rolUsuario = await Rol.findOne({
    where: { name: 'usuario' },
  });

  if (rolUsuario) {
    const usuarioDemo = await Usuario.findOne({
      where: {
        [Op.or]: [{ correo: 'demo@fotaza.test' }, { nombreUsuario: 'demo' }],
      },
    });

    if (!usuarioDemo) {
      const hashContrasena = await bcrypt.hash('123456', 10);

      await Usuario.create({
        idRol: rolUsuario.id,
        nombreUsuario: 'demo',
        correo: 'demo@fotaza.test',
        hashContrasena,
        nombreVisible: 'Usuario Demo',
      });
    }
  }

  const etiquetas = ['paisaje', 'retrato', 'urbano', 'naturaleza', 'viajes'];

  for (const nombreEtiqueta of etiquetas) {
    await Etiqueta.findOrCreate({
      where: { name: nombreEtiqueta },
      defaults: { name: nombreEtiqueta },
    });
  }
}

const baseDatosLista = inicializarBaseDatos();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Importante para cookies seguras detrás de Vercel/proxy
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(
  session({
    name: 'fotaza.sid',
    secret: process.env.SESSION_SECRET || 'fotaza-dev-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.VERCEL === '1',
      maxAge: duracionSesion,
    },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    await baseDatosLista;
    next();
  } catch (error) {
    next(error);
  }
});

app.use(async (req, res, next) => {
  try {
    res.locals.appName = 'Fotaza 2';
    res.locals.usuarioActual = req.session.usuario || null;
    res.locals.rutaActual = req.path;
    res.locals.filtrosBusqueda = {
      buscar: req.query.buscar?.trim() || '',
      etiqueta: req.query.etiqueta?.trim() || '',
    };
    res.locals.etiquetasDisponibles = await Etiqueta.findAll({
      order: [['name', 'ASC']],
    });

    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', postRouter);
app.use('/', usuarioRouter);

app.use((req, res) => {
  res.status(404).render('pages/inicio', {
    title: 'Pagina no encontrada',
    publicaciones: [],
  });
});

app.use((error, req, res, next) => {
  console.error('Error general de la app:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    original: error.original,
    parent: error.parent,
  });

  res.status(500).render('pages/inicio', {
    title: 'Error interno',
    publicaciones: [],
    mensajeError: 'Ocurrio un error interno. Intentalo nuevamente.',
  });
});

function verificarConexionDb() {
  baseDatosLista
    .then(() => {
      console.log('Base de datos inicializada correctamente.');
    })
    .catch((error) => {
      console.error(
        `No se pudo conectar a la base de datos: ${error.code || error.message}`
      );
    });
}

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    verificarConexionDb();
  });
} else {
  verificarConexionDb();
}

module.exports = app;
